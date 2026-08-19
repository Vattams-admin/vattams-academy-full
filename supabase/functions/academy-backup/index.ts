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

const sessionTables = [
  ['tuition_admin_sessions', 'admin'],
] as const;

async function adminSession(token: string) {
  if (!token) return null;

  for (const [table] of sessionTables) {
    const { data } = await db
      .from(table)
      .select('*')
      .eq('token', token)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (data) return {
      ...data,
      role: 'admin',
      userId: data.admin_id || data.user_id || data.id,
    };
  }

  return null;
}

async function countTable(table: string) {
  const { count, error } = await db
    .from(table)
    .select('*', { count: 'exact', head: true });

  if (error) {
    return { table, status: 'unavailable', count: null, error: error.message };
  }

  return { table, status: 'ok', count: count || 0 };
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

    if (body.action === 'readiness') {
      const tables = [
        'tuition_students',
        'tuition_tutors',
        'tuition_courses',
        'tuition_course_levels',
        'tuition_course_materials',
        'tuition_trial_requests',
        'tuition_classroom_sessions',
        'tuition_attendance',
        'tuition_assignments',
        'tuition_assignment_submissions',
        'tuition_tests',
        'tuition_test_attempts',
        'tuition_competitions',
        'tuition_competition_results',
        'tuition_certificates',
        'tuition_notifications',
        'tuition_announcements',
        'tuition_report_snapshots',
      ];

      const results = await Promise.all(tables.map(countTable));

      return json({
        generatedAt: new Date().toISOString(),
        databaseReachable: true,
        tables: results,
        backupScope: 'Academy application data readiness inventory',
        note: 'This endpoint inventories data for backup planning. It does not create or download a database dump.',
      });
    }

    if (body.action === 'manifest') {
      const { data, error } = await db
        .from('tuition_report_snapshots')
        .select('report_type,period_start,period_end,created_at')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      return json({
        generatedAt: new Date().toISOString(),
        application: 'VATTAMS Academy',
        phase: 38,
        includedDomains: [
          'students',
          'tutors',
          'courses',
          'materials',
          'trials',
          'classroom',
          'attendance',
          'assignments',
          'tests',
          'competitions',
          'certificates',
          'notifications',
          'announcements',
          'reports',
        ],
        recentReportSnapshots: data || [],
      });
    }

    if (body.action === 'createManifest') {
      const { data, error } = await db
        .from('tuition_report_snapshots')
        .insert({
          report_type: 'backup_manifest',
          period_start: body.periodStart || null,
          period_end: body.periodEnd || null,
          generated_by: session.userId,
          parameters: body.parameters || {},
          summary: {
            createdAt: new Date().toISOString(),
            scope: body.scope || 'academy',
            requestedBy: session.userId,
          },
        })
        .select()
        .single();

      if (error) throw error;

      return json({
        success: true,
        manifest: data,
        note: 'Manifest recorded. Use the managed Supabase backup/export process for the actual database backup.',
      });
    }

    if (body.action === 'recoveryChecklist') {
      return json({
        checklist: [
          'Confirm the latest managed database backup exists.',
          'Confirm the backup timestamp and retention window.',
          'Verify Supabase project and storage recovery procedures.',
          'Restore into a controlled environment first.',
          'Run migrations only after schema comparison.',
          'Verify tuition_students and tuition_tutors row counts.',
          'Verify historical student/tutor IDs and selections.',
          'Verify course/material/classroom/attendance data.',
          'Verify assignment/test/competition results.',
          'Verify certificates and QR verification.',
          'Verify notifications and reports.',
          'Run Student/Tutor/Admin login tests.',
          'Run Wi-Fi and mobile-data smoke tests.',
          'Only then consider production recovery complete.',
        ],
      });
    }

    return json({ error: 'Unknown action.' }, 400);
  } catch (error) {
    console.error('[academy-backup]', error);
    return json({
      error: error instanceof Error ? error.message : 'Unexpected error.',
    }, 500);
  }
});
