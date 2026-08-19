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

async function getSession(token: string) {
  const candidates = [
    ['tuition_admin_sessions', 'admin'],
    ['tuition_tutor_sessions', 'tutor'],
    ['tuition_student_sessions', 'student'],
  ] as const;

  for (const [table, role] of candidates) {
    const { data } = await db
      .from(table)
      .select('*')
      .eq('token', token)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();
    if (data) return { ...data, role };
  }
  return null;
}

function level(percentage: number) {
  if (percentage >= 90) return 'Outstanding';
  if (percentage >= 75) return 'Excellent';
  if (percentage >= 60) return 'Good';
  return 'Needs Improvement';
}

function grade(percentage: number) {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C';
  return 'D';
}

async function calculate(studentId: string, courseId: string, enrollmentId?: string) {
  const { data: classes, error: classError } = await db
    .from('tuition_class_sessions')
    .select('id,status,student_id')
    .eq('student_id', studentId)
    .eq('course_id', courseId);

  if (classError) throw classError;

  const sessionIds = (classes || []).map((x: any) => x.id);
  let attendance: any[] = [];

  if (sessionIds.length) {
    const { data, error } = await db
      .from('tuition_class_attendance')
      .select('*')
      .in('session_id', sessionIds)
      .eq('student_id', studentId);
    if (error) throw error;
    attendance = data || [];
  }

  const totalClasses = classes?.length || 0;
  const attended = attendance.filter((x: any) =>
    ['present', 'late'].includes(x.student_status)
  ).length;
  const attendancePct = totalClasses
    ? (attended / totalClasses) * 100
    : 0;

  const { data: assignments, error: assignmentError } = await db
    .from('tuition_assignments')
    .select('id,max_score')
    .eq('course_id', courseId);

  if (assignmentError) throw assignmentError;

  const assignmentIds = (assignments || []).map((x: any) => x.id);
  let submissions: any[] = [];

  if (assignmentIds.length) {
    const { data, error } = await db
      .from('tuition_assignment_submissions')
      .select('*')
      .in('assignment_id', assignmentIds)
      .eq('student_id', studentId);
    if (error) throw error;
    submissions = data || [];
  }

  const assignmentTotal = assignments?.length || 0;
  const assignmentSubmitted = submissions.length;
  const reviewed = submissions.filter((x: any) => x.score != null);
  const assignmentAverage = reviewed.length
    ? reviewed.reduce((sum: number, x: any) => {
        const max = Number(
          assignments?.find((a: any) => a.id === x.assignment_id)?.max_score || 100
        );
        return sum + (Number(x.score) / max) * 100;
      }, 0) / reviewed.length
    : 0;

  const { data: tests, error: testError } = await db
    .from('tuition_tests')
    .select('id')
    .eq('course_id', courseId);

  if (testError) throw testError;

  const testIds = (tests || []).map((x: any) => x.id);
  let attempts: any[] = [];

  if (testIds.length) {
    const { data, error } = await db
      .from('tuition_test_attempts')
      .select('*')
      .in('test_id', testIds)
      .eq('student_id', studentId)
      .in('status', ['auto_graded', 'reviewed']);

    if (error) throw error;
    attempts = data || [];
  }

  const testsAttempted = attempts.length;
  const testsPassed = attempts.filter((x: any) => x.passed).length;
  const testAverage = testsAttempted
    ? attempts.reduce((sum: number, x: any) => sum + Number(x.percentage || 0), 0) /
      testsAttempted
    : 0;

  // Course completion is based on the assessment/class activity available in
  // this release. Material/lesson completion can feed these fields later.
  const activityParts = [
    totalClasses ? attendancePct : null,
    assignmentTotal ? Math.min(100, (assignmentSubmitted / assignmentTotal) * 100) : null,
    tests.length ? Math.min(100, (testsAttempted / tests.length) * 100) : null,
  ].filter((x) => x != null) as number[];

  const completion = activityParts.length
    ? activityParts.reduce((a, b) => a + b, 0) / activityParts.length
    : 0;

  const weighted = [
    [attendancePct, totalClasses ? 0.25 : 0],
    [assignmentAverage, reviewed.length ? 0.30 : 0],
    [testAverage, testsAttempted ? 0.45 : 0],
  ];

  const weightTotal = weighted.reduce((s, x) => s + x[1], 0);
  const overall = weightTotal
    ? weighted.reduce((s, x) => s + x[0] * x[1], 0) / weightTotal
    : 0;

  const snapshot = {
    student_id: studentId,
    course_id: courseId,
    enrollment_id: enrollmentId || null,
    attendance_percentage: Number(attendancePct.toFixed(2)),
    classes_attended: attended,
    classes_total: totalClasses,
    assignments_submitted: assignmentSubmitted,
    assignments_total: assignmentTotal,
    assignment_average: Number(assignmentAverage.toFixed(2)),
    tests_attempted: testsAttempted,
    tests_passed: testsPassed,
    test_average: Number(testAverage.toFixed(2)),
    course_completion_percentage: Number(Math.min(100, completion).toFixed(2)),
    overall_percentage: Number(overall.toFixed(2)),
    performance_level: level(overall),
    snapshot_at: new Date().toISOString(),
  };

  const { data: saved, error: saveError } = await db
    .from('tuition_progress_snapshots')
    .insert(snapshot)
    .select()
    .single();

  if (saveError) throw saveError;

  return {
    ...snapshot,
    id: saved.id,
    grade: grade(overall),
    passed: overall >= 40,
  };
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
    const user = await getSession(token);
    if (!user) return json({ error: 'Invalid or expired session.' }, 401);

    if (body.action === 'myProgress') {
      if (user.role !== 'student') {
        return json({ error: 'Student access required.' }, 403);
      }

      let query = db
        .from('tuition_progress_snapshots')
        .select('*')
        .eq('student_id', user.user_id)
        .order('snapshot_at', { ascending: false });

      if (body.courseId) query = query.eq('course_id', body.courseId);

      const { data, error } = await query;
      if (error) throw error;

      return json({ progress: data || [] });
    }

    if (body.action === 'myResults') {
      if (user.role !== 'student') {
        return json({ error: 'Student access required.' }, 403);
      }

      let query = db
        .from('tuition_result_records')
        .select('*')
        .eq('student_id', user.user_id)
        .order('result_date', { ascending: false });

      if (body.courseId) query = query.eq('course_id', body.courseId);

      const { data, error } = await query;
      if (error) throw error;

      return json({ results: data || [] });
    }

    if (body.action === 'studentReport') {
      if (!['admin', 'tutor'].includes(user.role)) {
        return json({ error: 'Tutor/Admin access required.' }, 403);
      }

      const studentId = body.studentId;
      if (!studentId) return json({ error: 'Student ID is required.' }, 400);

      let query = db
        .from('tuition_progress_snapshots')
        .select('*')
        .eq('student_id', studentId)
        .order('snapshot_at', { ascending: false });

      if (body.courseId) query = query.eq('course_id', body.courseId);

      const { data: progress, error: progressError } = await query;
      if (progressError) throw progressError;

      let resultsQuery = db
        .from('tuition_result_records')
        .select('*')
        .eq('student_id', studentId)
        .order('result_date', { ascending: false });

      if (body.courseId) resultsQuery = resultsQuery.eq('course_id', body.courseId);

      const { data: results, error: resultsError } = await resultsQuery;
      if (resultsError) throw resultsError;

      return json({ progress: progress || [], results: results || [] });
    }

    if (body.action === 'tutorReports') {
      if (!['admin', 'tutor'].includes(user.role)) {
        return json({ error: 'Tutor/Admin access required.' }, 403);
      }

      const { data: progress, error } = await db
        .from('tuition_progress_snapshots')
        .select('*')
        .order('snapshot_at', { ascending: false })
        .limit(500);

      if (error) throw error;
      return json({ progress: progress || [] });
    }

    if (body.action === 'refreshProgress') {
      if (!['admin', 'tutor'].includes(user.role)) {
        return json({ error: 'Tutor/Admin access required.' }, 403);
      }

      if (!body.studentId || !body.courseId) {
        return json({ error: 'Student and course are required.' }, 400);
      }

      const result = await calculate(
        body.studentId,
        body.courseId,
        body.enrollmentId,
      );

      return json({ progress: result });
    }

    return json({ error: 'Unknown action.' }, 400);
  } catch (error) {
    console.error('[tuition-progress]', error);
    return json(
      { error: error instanceof Error ? error.message : 'Unexpected error.' },
      500,
    );
  }
});
