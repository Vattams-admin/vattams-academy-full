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

function daysBack(days: number) {
  const safe = Math.min(Math.max(Number(days) || 30, 1), 90);
  const dates: string[] = [];
  const now = new Date();
  for (let i = safe - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

async function countRows(
  table: string,
  filters: Array<[string, string, unknown]> = [],
) {
  let q: any = db.from(table).select('*', { count: 'exact', head: true });
  for (const [column, operator, value] of filters) {
    if (operator === 'eq') q = q.eq(column, value);
    if (operator === 'neq') q = q.neq(column, value);
    if (operator === 'in') q = q.in(column, value);
  }
  const { count, error } = await q;
  if (error) throw error;
  return count || 0;
}

async function buildDaily(date: string) {
  const start = `${date}T00:00:00.000Z`;
  const endDate = new Date(`${date}T00:00:00.000Z`);
  endDate.setUTCDate(endDate.getUTCDate() + 1);
  const end = endDate.toISOString();

  const [
    studentsTotal,
    studentsActive,
    tutorsTotal,
    tutorsApproved,
    coursesTotal,
    enrollmentsTotal,
    classesTotal,
    classesCompleted,
    assignmentsSubmitted,
    testsAttempted,
    competitionsTotal,
    certificatesIssued,
    notificationsSent,
  ] = await Promise.all([
    countRows('tuition_students'),
    countRows('tuition_students', [['status', 'eq', 'active']]),
    countRows('tuition_tutors'),
    countRows('tuition_tutors', [['status', 'eq', 'approved']]),
    countRows('tuition_courses'),
    countRows('tuition_enrollments'),
    countRows('tuition_class_sessions', [['created_at', 'gte', start], ['created_at', 'lt', end]]),
    countRows('tuition_class_sessions', [['status', 'eq', 'completed'], ['created_at', 'gte', start], ['created_at', 'lt', end]]),
    countRows('tuition_assignment_submissions', [['created_at', 'gte', start], ['created_at', 'lt', end]]),
    countRows('tuition_test_attempts', [['created_at', 'gte', start], ['created_at', 'lt', end]]),
    countRows('tuition_competitions', [['created_at', 'gte', start], ['created_at', 'lt', end]]),
    countRows('tuition_certificates', [['issued_at', 'gte', start], ['issued_at', 'lt', end]]),
    countRows('tuition_user_notifications', [['created_at', 'gte', start], ['created_at', 'lt', end]]),
  ]);

  let attendancePercentage = 0;
  const { data: attendanceRows, error: attendanceError } = await db
    .from('tuition_class_attendance')
    .select('student_status,created_at')
    .gte('created_at', start)
    .lt('created_at', end);

  if (attendanceError) throw attendanceError;

  if ((attendanceRows || []).length) {
    const attended = (attendanceRows || []).filter((row: any) =>
      ['present', 'late'].includes(row.student_status)
    ).length;
    attendancePercentage = (attended / attendanceRows.length) * 100;
  }

  const row = {
    metric_date: date,
    students_total: studentsTotal,
    students_active: studentsActive,
    tutors_total: tutorsTotal,
    tutors_approved: tutorsApproved,
    courses_total: coursesTotal,
    enrollments_total: enrollmentsTotal,
    classes_total: classesTotal,
    classes_completed: classesCompleted,
    attendance_percentage: Number(attendancePercentage.toFixed(2)),
    assignments_submitted: assignmentsSubmitted,
    tests_attempted: testsAttempted,
    competitions_total: competitionsTotal,
    certificates_issued: certificatesIssued,
    notifications_sent: notificationsSent,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await db
    .from('tuition_analytics_daily')
    .upsert(row, { onConflict: 'metric_date' })
    .select()
    .single();

  if (error) throw error;
  return data;
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

    if (body.action === 'overview') {
      if (user.role !== 'admin') {
        return json({ error: 'Admin access required.' }, 403);
      }

      const [
        students,
        activeStudents,
        tutors,
        approvedTutors,
        courses,
        enrollments,
        competitions,
        certificates,
        unreadNotifications,
      ] = await Promise.all([
        countRows('tuition_students'),
        countRows('tuition_students', [['status', 'eq', 'active']]),
        countRows('tuition_tutors'),
        countRows('tuition_tutors', [['status', 'eq', 'approved']]),
        countRows('tuition_courses'),
        countRows('tuition_enrollments'),
        countRows('tuition_competitions'),
        countRows('tuition_certificates', [['status', 'eq', 'issued']]),
        countRows('tuition_user_notifications', [['is_read', 'eq', false]]),
      ]);

      const { data: latest, error } = await db
        .from('tuition_analytics_daily')
        .select('*')
        .order('metric_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      return json({
        overview: {
          students,
          activeStudents,
          tutors,
          approvedTutors,
          courses,
          enrollments,
          competitions,
          certificates,
          unreadNotifications,
          latestDaily: latest || null,
        },
      });
    }

    if (body.action === 'daily') {
      if (user.role !== 'admin') {
        return json({ error: 'Admin access required.' }, 403);
      }

      const dates = daysBack(body.days || 30);
      const { data, error } = await db
        .from('tuition_analytics_daily')
        .select('*')
        .gte('metric_date', dates[0])
        .lte('metric_date', dates[dates.length - 1])
        .order('metric_date', { ascending: true });

      if (error) throw error;

      return json({ daily: data || [], requestedDays: dates.length });
    }

    if (body.action === 'activity') {
      if (user.role !== 'admin') {
        return json({ error: 'Admin access required.' }, 403);
      }

      const limit = Math.min(Math.max(Number(body.limit) || 50, 1), 200);
      const { data, error } = await db
        .from('tuition_admin_activity_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return json({ activity: data || [] });
    }

    if (body.action === 'refreshDaily') {
      if (user.role !== 'admin') {
        return json({ error: 'Admin access required.' }, 403);
      }

      const date = body.date || new Date().toISOString().slice(0, 10);
      const data = await buildDaily(date);

      await db.from('tuition_admin_activity_log').insert({
        admin_id: user.user_id,
        action: 'refresh_daily_analytics',
        entity_type: 'analytics',
        description: `Refreshed Academy analytics for ${date}`,
        metadata: { date },
      });

      return json({ daily: data });
    }

    return json({ error: 'Unknown action.' }, 400);
  } catch (error) {
    console.error('[tuition-analytics]', error);
    return json(
      { error: error instanceof Error ? error.message : 'Unexpected error.' },
      500,
    );
  }
});
