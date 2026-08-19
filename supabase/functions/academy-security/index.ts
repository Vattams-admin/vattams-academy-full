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
  ['tuition_student_sessions', 'student'],
  ['tuition_tutor_sessions', 'tutor'],
  ['tuition_admin_sessions', 'admin'],
] as const;

async function findSession(token: string, expectedRole?: string) {
  if (!token) return null;

  for (const [table, role] of sessionTables) {
    if (expectedRole && expectedRole !== role) continue;

    const { data } = await db
      .from(table)
      .select('*')
      .eq('token', token)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (data) {
      return {
        ...data,
        role,
        table,
        userId: data.student_id || data.tutor_id || data.admin_id ||
          data.user_id || data.id,
      };
    }
  }

  return null;
}

function hashIdentifier(value: string) {
  const bytes = new TextEncoder().encode(value.trim().toLowerCase());
  return crypto.subtle.digest('SHA-256', bytes).then((buffer) =>
    Array.from(new Uint8Array(buffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  );
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors });
  }

  if (req.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);

  try {
    const body = await req.json();
    const role = body.role;
    const token =
      body.token ||
      req.headers.get('Authorization')?.replace(/^Bearer\s+/i, '') ||
      '';

    const session = await findSession(token, role);

    if (!session) {
      return json({ error: 'Invalid or expired session.' }, 401);
    }

    if (body.action === 'validateSession') {
      return json({
        valid: true,
        role: session.role,
        userId: session.userId,
        expiresAt: session.expires_at,
      });
    }

    if (body.action === 'event') {
      const eventType = String(body.eventType || '').trim();
      if (!eventType) return json({ error: 'Event type is required.' }, 400);

      const { error } = await db
        .from('tuition_security_events')
        .insert({
          actor_role: session.role,
          actor_id: session.userId,
          event_type: eventType,
          success: true,
          metadata: body.metadata || {},
        });

      if (error) throw error;
      return json({ success: true });
    }

    if (body.action === 'summary') {
      if (session.role !== 'admin') return json({ error: 'Admin access required.' }, 403);

      const since = new Date();
      since.setUTCDate(since.getUTCDate() - 30);

      const { data, error } = await db
        .from('tuition_security_events')
        .select('event_type,success,actor_role,created_at')
        .gte('created_at', since.toISOString())
        .order('created_at', { ascending: false })
        .limit(5000);

      if (error) throw error;

      const rows = data || [];
      return json({
        periodDays: 30,
        totalEvents: rows.length,
        successfulEvents: rows.filter((x: any) => x.success).length,
        failedEvents: rows.filter((x: any) => !x.success).length,
        byType: rows.reduce((acc: Record<string, number>, row: any) => {
          acc[row.event_type] = (acc[row.event_type] || 0) + 1;
          return acc;
        }, {}),
      });
    }

    if (body.action === 'cleanupSessions') {
      if (session.role !== 'admin') return json({ error: 'Admin access required.' }, 403);

      const now = new Date().toISOString();
      const tables = [
        'tuition_student_sessions',
        'tuition_tutor_sessions',
        'tuition_admin_sessions',
      ];

      const results: Record<string, string> = {};

      for (const table of tables) {
        const { error } = await db
          .from(table)
          .delete()
          .lt('expires_at', now);

        results[table] = error ? `error: ${error.message}` : 'cleaned';
      }

      return json({ success: true, results });
    }

    return json({ error: 'Unknown action.' }, 400);
  } catch (error) {
    console.error('[academy-security]', error);
    return json({
      error: error instanceof Error ? error.message : 'Unexpected error.',
    }, 500);
  }
});
