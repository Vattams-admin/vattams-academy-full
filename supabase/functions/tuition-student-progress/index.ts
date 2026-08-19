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
  const checks = [
    ['tuition_student_sessions', 'student'],
    ['tuition_tutor_sessions', 'tutor'],
    ['tuition_admin_sessions', 'admin'],
  ] as const;

  for (const [table, role] of checks) {
    const { data } = await db
      .from(table)
      .select('*')
      .eq('token', token)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (data) return { ...data, role };
  }

  const tokenBytes = new TextEncoder().encode(token);
  const digest = await crypto.subtle.digest('SHA-256', tokenBytes);
  const tokenHash = Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  const { data: guardianSession } = await db
    .from('tuition_guardian_sessions')
    .select('*, tuition_guardians(*)')
    .eq('token_hash', tokenHash)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();

  if (guardianSession) {
    return {
      ...guardianSession,
      role: 'guardian',
      guardian: guardianSession.tuition_guardians,
    };
  }

  return null;
}

function dateList(days: number) {
  const safe = Math.min(Math.max(Number(days) || 30, 1), 90);
  const result: string[] = [];
  const now = new Date();

  for (let i = safe - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    result.push(d.toISOString().slice(0, 10));
  }

  return result;
}

async function count(
  table: string,
  filters: Array<[string, unknown]> = [],
) {
  let query: any = db.from(table).select('*', { count: 'exact', head: true });
  for (const [column, value] of filters) query = query.eq(column, value);
  const { count: result, error } = await query;
  if (error) throw error;
  return result || 0;
}

async function maybeCount(
  table: string,
  filters: Array<[string, unknown]> = [],
) {
  try {
    return await count(table, filters);
  } catch {
    // Optional activity tables can differ between legacy deployments.
    // Missing optional sources should not make the whole progress page fail.
    return 0;
  }
}

async function buildSnapshot(studentId: string, snapshotDate: string) {
  const start = `${snapshotDate}T00:00:00.000Z`;
  const endDate = new Date(`${snapshotDate}T00:00:00.000Z`);
  endDate.setUTCDate(endDate.getUTCDate() + 1);
  const end = endDate.toISOString();

  const [
    classesTotal,
    classesCompleted,
    assignmentsSubmitted,
    testsAttempted,
    testsPassed,
    competitionsAttempted,
    certificatesIssued,
  ] = await Promise.all([
    maybeCount('tuition_class_sessions', [['student_id', studentId]]),
    maybeCount('tuition_class_sessions', [['student_id', studentId], ['status', 'completed']]),
    maybeCount('tuition_assignment_submissions', [['student_id', studentId]]),
    maybeCount('tuition_test_attempts', [['student_id', studentId]]),
    maybeCount('tuition_test_attempts', [['student_id', studentId], ['status', 'passed']]),
    maybeCount('tuition_competition_attempts', [['student_id', studentId]]),
    maybeCount('tuition_certificates', [['student_id', studentId], ['status', 'issued']]),
  ]);

  let attendancePercentage = 0;
  try {
    const { data, error } = await db
      .from('tuition_class_attendance')
      .select('student_status,created_at')
      .eq('student_id', studentId)
      .gte('created_at', start)
      .lt('created_at', end);

    if (!error && data?.length) {
      const attended = data.filter((row: any) =>
        ['present', 'late'].includes(row.student_status),
      ).length;
      attendancePercentage = (attended / data.length) * 100;
    }
  } catch {
    attendancePercentage = 0;
  }

  let averageTestPercentage = 0;
  try {
    const { data } = await db
      .from('tuition_test_attempts')
      .select('percentage')
      .eq('student_id', studentId)
      .not('percentage', 'is', null);

    const values = (data || [])
      .map((row: any) => Number(row.percentage))
      .filter((value: number) => Number.isFinite(value));

    if (values.length) {
      averageTestPercentage =
        values.reduce((sum: number, value: number) => sum + value, 0) /
        values.length;
    }
  } catch {
    averageTestPercentage = 0;
  }

  const completionRate = classesTotal
    ? (classesCompleted / classesTotal) * 100
    : 0;

  const progressPercentage = Math.min(
    100,
    Math.max(
      0,
      completionRate * 0.35 +
        attendancePercentage * 0.25 +
        averageTestPercentage * 0.30 +
        (certificatesIssued > 0 ? 10 : 0),
    ),
  );

  const row = {
    student_id: studentId,
    snapshot_date: snapshotDate,
    classes_total: classesTotal,
    classes_completed: classesCompleted,
    attendance_percentage: Number(attendancePercentage.toFixed(2)),
    assignments_submitted: assignmentsSubmitted,
    tests_attempted: testsAttempted,
    tests_passed: testsPassed,
    average_test_percentage: Number(averageTestPercentage.toFixed(2)),
    competitions_attempted: competitionsAttempted,
    certificates_issued: certificatesIssued,
    progress_percentage: Number(progressPercentage.toFixed(2)),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await db
    .from('tuition_student_progress_snapshots')
    .upsert(row, { onConflict: 'student_id,snapshot_date' })
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function studentAllowed(
  session: any,
  studentId: string,
  requiredShare?: string,
) {
  if (session.role === 'admin') return true;

  if (session.role === 'student') {
    return session.student_id === studentId || session.user_id === studentId;
  }

  if (session.role === 'guardian') {
    const guardianId = session.guardian?.id;
    if (!guardianId) return false;

    const { data } = await db
      .from('tuition_guardian_shares')
      .select('share_type,expires_at')
      .eq('guardian_id', guardianId)
      .eq('student_id', studentId)
      .eq('status', 'active');

    return (data || []).some((share: any) => {
      const valid = !share.expires_at ||
        new Date(share.expires_at).getTime() > Date.now();
      return valid && (
        share.share_type === 'all' ||
        !requiredShare ||
        share.share_type === requiredShare
      );
    });
  }

  return false;
}

async function currentStudent(session: any) {
  if (session.role === 'student') return session.student_id || session.user_id;

  if (session.role === 'guardian') {
    return null;
  }

  return null;
}

async function getLatestSnapshot(studentId: string) {
  const { data, error } = await db
    .from('tuition_student_progress_snapshots')
    .select('*')
    .eq('student_id', studentId)
    .order('snapshot_date', { ascending: false })
    .limit(1)
    .maybeSingle();

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

    const session = await getSession(token);
    if (!session) return json({ error: 'Invalid or expired session.' }, 401);

    if (body.action === 'myProgress') {
      const studentId = await currentStudent(session);
      if (!studentId) {
        return json({ error: 'Student session required.' }, 403);
      }

      const latest = await getLatestSnapshot(studentId);
      if (!latest) {
        const today = new Date().toISOString().slice(0, 10);
        return json({ progress: await buildSnapshot(studentId, today) });
      }

      return json({ progress: latest });
    }

    if (body.action === 'myHistory') {
      const studentId = await currentStudent(session);
      if (!studentId) return json({ error: 'Student session required.' }, 403);

      const dates = dateList(body.days || 30);
      const { data, error } = await db
        .from('tuition_student_progress_snapshots')
        .select('*')
        .eq('student_id', studentId)
        .gte('snapshot_date', dates[0])
        .lte('snapshot_date', dates[dates.length - 1])
        .order('snapshot_date', { ascending: true });

      if (error) throw error;
      return json({ history: data || [] });
    }

    if (body.action === 'studentProgress' || body.action === 'studentHistory') {
      if (session.role !== 'admin') {
        return json({ error: 'Admin access required.' }, 403);
      }

      if (!body.studentId) return json({ error: 'Student ID is required.' }, 400);

      if (body.action === 'studentProgress') {
        return json({ progress: await getLatestSnapshot(body.studentId) });
      }

      const dates = dateList(body.days || 30);
      const { data, error } = await db
        .from('tuition_student_progress_snapshots')
        .select('*')
        .eq('student_id', body.studentId)
        .gte('snapshot_date', dates[0])
        .lte('snapshot_date', dates[dates.length - 1])
        .order('snapshot_date', { ascending: true });

      if (error) throw error;
      return json({ history: data || [] });
    }

    if (body.action === 'refreshSnapshot') {
      if (session.role !== 'admin') {
        return json({ error: 'Admin access required.' }, 403);
      }

      if (!body.studentId) return json({ error: 'Student ID is required.' }, 400);

      const snapshotDate =
        body.snapshotDate || new Date().toISOString().slice(0, 10);

      const snapshot = await buildSnapshot(body.studentId, snapshotDate);

      return json({ progress: snapshot });
    }

    return json({ error: 'Unknown action.' }, 400);
  } catch (error) {
    console.error('[tuition-student-progress]', error);
    return json({
      error: error instanceof Error ? error.message : 'Unexpected error.',
    }, 500);
  }
});
