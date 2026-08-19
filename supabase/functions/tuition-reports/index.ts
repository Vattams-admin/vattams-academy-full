import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const db = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

const cors = {
  'Access-Control-Allow-Origin': 'https://vattams.net',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: cors });

async function adminSession(token: string) {
  if (!token) return null;

  const { data } = await db
    .from('tuition_admin_sessions')
    .select('*')
    .eq('token', token)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();

  return data;
}

const dateOr = (value: unknown, fallback: string) =>
  typeof value === 'string' && value ? value : fallback;

const defaultStart = () => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 30);
  return d.toISOString().slice(0, 10);
};

const today = () => new Date().toISOString().slice(0, 10);

async function count(table: string, filters: Record<string, unknown> = {}) {
  let query: any = db.from(table).select('*', { count: 'exact', head: true });
  for (const [key, value] of Object.entries(filters)) query = query.eq(key, value);
  const { count: result, error } = await query;
  if (error) throw error;
  return result || 0;
}

async function countPeriod(
  table: string,
  column: string,
  start: string,
  end: string,
  filters: Record<string, unknown> = {},
) {
  let query: any = db
    .from(table)
    .select('*', { count: 'exact', head: true })
    .gte(column, `${start}T00:00:00.000Z`)
    .lte(column, `${end}T23:59:59.999Z`);

  for (const [key, value] of Object.entries(filters)) query = query.eq(key, value);
  const { count: result, error } = await query;
  if (error) throw error;
  return result || 0;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors });
  }

  if (req.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);

  try {
    const body = await req.json();
    const token =
      body.token ||
      req.headers.get('Authorization')?.replace(/^Bearer\s+/i, '') ||
      '';

    const session = await adminSession(token);
    if (!session) return json({ error: 'Invalid or expired admin session.' }, 401);

    const start = dateOr(body.periodStart, defaultStart());
    const end = dateOr(body.periodEnd, today());

    if (body.action === 'dashboard') {
      const [
        students,
        tutors,
        courses,
        assignments,
        tests,
        competitions,
        certificates,
        classes,
      ] = await Promise.all([
        count('tuition_students'),
        count('tuition_tutors'),
        count('tuition_courses'),
        countPeriod('tuition_assignments', 'created_at', start, end),
        countPeriod('tuition_tests', 'created_at', start, end),
        countPeriod('tuition_competitions', 'created_at', start, end),
        countPeriod('tuition_certificates', 'created_at', start, end),
        countPeriod('tuition_classroom_sessions', 'created_at', start, end),
      ]);

      const [
        assignmentSubmissions,
        testAttempts,
        competitionResults,
        attendanceRows,
      ] = await Promise.all([
        countPeriod('tuition_assignment_submissions', 'submitted_at', start, end),
        countPeriod('tuition_test_attempts', 'submitted_at', start, end),
        countPeriod('tuition_competition_results', 'published_at', start, end),
        countPeriod('tuition_attendance', 'created_at', start, end),
      ]);

      return json({
        period: { start, end },
        totals: {
          students,
          tutors,
          courses,
          classes,
          assignments,
          assignmentSubmissions,
          tests,
          testAttempts,
          competitions,
          competitionResults,
          certificates,
          attendanceRows,
        },
      });
    }

    if (body.action === 'studentProgress') {
      const { data: students, error } = await db
        .from('tuition_students')
        .select('id,student_id,created_at')
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) throw error;

      const ids = (students || []).map((s: any) => s.id);

      const [attendance, submissions, attempts, certificates] = await Promise.all([
        ids.length
          ? db.from('tuition_attendance').select('student_id,status,created_at').in('student_id', ids)
          : { data: [] },
        ids.length
          ? db.from('tuition_assignment_submissions').select('student_id,status,score,submitted_at').in('student_id', ids)
          : { data: [] },
        ids.length
          ? db.from('tuition_test_attempts').select('student_id,status,percentage,created_at').in('student_id', ids)
          : { data: [] },
        ids.length
          ? db.from('tuition_certificates').select('student_id,status,issue_date').in('student_id', ids)
          : { data: [] },
      ]);

      const rows = (students || []).map((student: any) => {
        const a = (attendance.data || []).filter((x: any) => x.student_id === student.id);
        const s = (submissions.data || []).filter((x: any) => x.student_id === student.id);
        const t = (attempts.data || []).filter((x: any) => x.student_id === student.id && x.status !== 'in_progress');
        const c = (certificates.data || []).filter((x: any) => x.student_id === student.id && x.status === 'issued');

        const attended = a.filter((x: any) =>
          String(x.status || '').toLowerCase() === 'present' ||
          String(x.status || '').toLowerCase() === 'completed'
        ).length;

        const attendanceRate = a.length ? Number(((attended / a.length) * 100).toFixed(1)) : 0;
        const testAverage = t.length
          ? Number((t.reduce((sum: number, x: any) => sum + Number(x.percentage || 0), 0) / t.length).toFixed(1))
          : 0;

        return {
          id: student.id,
          student_id: student.student_id,
          attendanceRate,
          assignmentSubmissions: s.length,
          reviewedAssignments: s.filter((x: any) => x.status === 'reviewed').length,
          testAttempts: t.length,
          testAverage,
          certificates: c.length,
        };
      });

      return json({ period: { start, end }, students: rows });
    }

    if (body.action === 'tutorPerformance') {
      const { data: tutors, error } = await db
        .from('tuition_tutors')
        .select('id,employee_id,created_at')
        .limit(500);

      if (error) throw error;

      const ids = (tutors || []).map((t: any) => t.id);

      const [assignments, tests, classes] = await Promise.all([
        ids.length ? db.from('tuition_assignments').select('tutor_id,status,created_at').in('tutor_id', ids) : { data: [] },
        ids.length ? db.from('tuition_tests').select('tutor_id,status,created_at').in('tutor_id', ids) : { data: [] },
        ids.length ? db.from('tuition_classroom_sessions').select('tutor_id,status,created_at').in('tutor_id', ids) : { data: [] },
      ]);

      const rows = (tutors || []).map((tutor: any) => {
        const a = (assignments.data || []).filter((x: any) => x.tutor_id === tutor.id);
        const te = (tests.data || []).filter((x: any) => x.tutor_id === tutor.id);
        const cl = (classes.data || []).filter((x: any) => x.tutor_id === tutor.id);

        return {
          id: tutor.id,
          employee_id: tutor.employee_id,
          assignmentsCreated: a.length,
          publishedAssignments: a.filter((x: any) => x.status === 'published').length,
          testsCreated: te.length,
          publishedTests: te.filter((x: any) => x.status === 'published').length,
          classesCreated: cl.length,
          completedClasses: cl.filter((x: any) => x.status === 'completed').length,
        };
      });

      return json({ period: { start, end }, tutors: rows });
    }

    if (body.action === 'coursePerformance') {
      const { data: courses, error } = await db
        .from('tuition_courses')
        .select('id,name,title,created_at')
        .limit(500);

      if (error) throw error;

      const ids = (courses || []).map((c: any) => c.id);

      const [assignments, tests, competitions, certificates] = await Promise.all([
        ids.length ? db.from('tuition_assignments').select('course_id,status').in('course_id', ids) : { data: [] },
        ids.length ? db.from('tuition_tests').select('course_id,status').in('course_id', ids) : { data: [] },
        ids.length ? db.from('tuition_competitions').select('course_id,status').in('course_id', ids) : { data: [] },
        ids.length ? db.from('tuition_certificates').select('course_id,status').in('course_id', ids) : { data: [] },
      ]);

      const rows = (courses || []).map((course: any) => {
        const a = (assignments.data || []).filter((x: any) => x.course_id === course.id);
        const t = (tests.data || []).filter((x: any) => x.course_id === course.id);
        const c = (competitions.data || []).filter((x: any) => x.course_id === course.id);
        const cert = (certificates.data || []).filter((x: any) => x.course_id === course.id);

        return {
          id: course.id,
          name: course.name || course.title || 'Course',
          assignments: a.length,
          tests: t.length,
          competitions: c.length,
          certificates: cert.filter((x: any) => x.status === 'issued').length,
        };
      });

      return json({ period: { start, end }, courses: rows });
    }

    if (body.action === 'attendance') {
      const { data, error } = await db
        .from('tuition_attendance')
        .select('*')
        .gte('created_at', `${start}T00:00:00.000Z`)
        .lte('created_at', `${end}T23:59:59.999Z`)
        .order('created_at', { ascending: false })
        .limit(5000);

      if (error) throw error;

      const rows = data || [];
      const present = rows.filter((x: any) =>
        ['present', 'completed'].includes(String(x.status || '').toLowerCase())
      ).length;

      return json({
        period: { start, end },
        total: rows.length,
        present,
        absent: Math.max(0, rows.length - present),
        attendanceRate: rows.length ? Number(((present / rows.length) * 100).toFixed(1)) : 0,
      });
    }

    if (body.action === 'assessments') {
      const [assignments, tests] = await Promise.all([
        db.from('tuition_assignment_submissions')
          .select('score,status,submitted_at')
          .gte('submitted_at', `${start}T00:00:00.000Z`)
          .lte('submitted_at', `${end}T23:59:59.999Z`)
          .limit(5000),
        db.from('tuition_test_attempts')
          .select('percentage,status,submitted_at')
          .gte('submitted_at', `${start}T00:00:00.000Z`)
          .lte('submitted_at', `${end}T23:59:59.999Z`)
          .limit(5000),
      ]);

      const testRows = tests.data || [];
      const completedTests = testRows.filter((x: any) => x.status !== 'in_progress');
      const averageTestScore = completedTests.length
        ? Number((completedTests.reduce((sum: number, x: any) => sum + Number(x.percentage || 0), 0) / completedTests.length).toFixed(1))
        : 0;

      const assignmentRows = assignments.data || [];
      const reviewed = assignmentRows.filter((x: any) => x.status === 'reviewed');

      return json({
        period: { start, end },
        assignments: {
          submissions: assignmentRows.length,
          reviewed: reviewed.length,
          averageScore: reviewed.length
            ? Number((reviewed.reduce((sum: number, x: any) => sum + Number(x.score || 0), 0) / reviewed.length).toFixed(1))
            : 0,
        },
        tests: {
          attempts: testRows.length,
          completed: completedTests.length,
          averagePercentage: averageTestScore,
        },
      });
    }

    if (body.action === 'competitions') {
      const { data, error } = await db
        .from('tuition_competition_results')
        .select('competition_id,student_id,score,percentage,rank,award,published_at')
        .gte('published_at', `${start}T00:00:00.000Z`)
        .lte('published_at', `${end}T23:59:59.999Z`)
        .order('rank', { ascending: true, nullsFirst: false })
        .limit(5000);

      if (error) throw error;

      const rows = data || [];
      return json({
        period: { start, end },
        results: rows.length,
        averagePercentage: rows.length
          ? Number((rows.reduce((sum: number, x: any) => sum + Number(x.percentage || 0), 0) / rows.length).toFixed(1))
          : 0,
        awards: {
          excellence: rows.filter((x: any) => x.award === 'Excellence').length,
          distinction: rows.filter((x: any) => x.award === 'Distinction').length,
          merit: rows.filter((x: any) => x.award === 'Merit').length,
        },
      });
    }

    if (body.action === 'certificates') {
      const { data, error } = await db
        .from('tuition_certificates')
        .select('certificate_type,status,issue_date,percentage')
        .gte('issue_date', start)
        .lte('issue_date', end)
        .limit(5000);

      if (error) throw error;

      const rows = data || [];
      return json({
        period: { start, end },
        issued: rows.filter((x: any) => x.status === 'issued').length,
        revoked: rows.filter((x: any) => x.status === 'revoked').length,
        byType: {
          course: rows.filter((x: any) => x.certificate_type === 'course').length,
          competition: rows.filter((x: any) => x.certificate_type === 'competition').length,
          achievement: rows.filter((x: any) => x.certificate_type === 'achievement').length,
          completion: rows.filter((x: any) => x.certificate_type === 'completion').length,
        },
      });
    }

    if (body.action === 'saveSnapshot') {
      const reportType = String(body.reportType || '');
      if (!reportType) return json({ error: 'Report type is required.' }, 400);

      const { data, error } = await db
        .from('tuition_report_snapshots')
        .insert({
          report_type: reportType,
          period_start: body.periodStart || start,
          period_end: body.periodEnd || end,
          generated_by: session.admin_id || session.user_id || session.id,
          parameters: body.parameters || {},
          summary: body.summary || {},
        })
        .select()
        .single();

      if (error) throw error;
      return json({ snapshot: data });
    }

    if (body.action === 'snapshots') {
      let query: any = db
        .from('tuition_report_snapshots')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (body.reportType) query = query.eq('report_type', body.reportType);

      const { data, error } = await query;
      if (error) throw error;

      return json({ snapshots: data || [] });
    }

    return json({ error: 'Unknown action.' }, 400);
  } catch (error) {
    console.error('[tuition-reports]', error);
    return json({
      error: error instanceof Error ? error.message : 'Unexpected error.',
    }, 500);
  }
});
