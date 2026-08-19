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

async function sessionFor(token: string) {
  if (!token) return null;

  const tables = [
    ['tuition_student_sessions', 'student'],
    ['tuition_tutor_sessions', 'tutor'],
    ['tuition_admin_sessions', 'admin'],
  ] as const;

  for (const [table, role] of tables) {
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

function currentUserId(session: any) {
  return session.student_id || session.tutor_id || session.user_id || session.id;
}

async function refreshStatus(session: any) {
  if (session.status === 'scheduled') return;

  const now = Date.now();
  const start = new Date(session.scheduled_start).getTime();
  const end = new Date(session.scheduled_end).getTime();

  let status = session.status;
  if (now >= start && now < end && status !== 'cancelled') status = 'live';
  if (now >= end && status !== 'cancelled') status = 'completed';

  if (status !== session.status) {
    await db
      .from('tuition_classroom_sessions')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', session.id);
    session.status = status;
  }

  return session;
}

async function studentSessionAllowed(studentId: string, sessionId: string) {
  const { data } = await db
    .from('tuition_classroom_session_access')
    .select('*')
    .eq('student_id', studentId)
    .eq('session_id', sessionId)
    .eq('access_status', 'allowed')
    .maybeSingle();

  return !!data;
}

async function tutorOwnsSession(tutorId: string, sessionId: string) {
  const { data } = await db
    .from('tuition_classroom_sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('tutor_id', tutorId)
    .maybeSingle();

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

    const session = await sessionFor(token);
    if (!session) return json({ error: 'Invalid or expired session.' }, 401);

    if (body.action === 'studentSessions') {
      if (session.role !== 'student') {
        return json({ error: 'Student access required.' }, 403);
      }

      const studentId = currentUserId(session);

      const { data: access, error: accessError } = await db
        .from('tuition_classroom_session_access')
        .select('session_id,access_status')
        .eq('student_id', studentId)
        .eq('access_status', 'allowed');

      if (accessError) throw accessError;

      const ids = (access || []).map((row: any) => row.session_id);
      if (!ids.length) return json({ sessions: [] });

      const { data, error } = await db
        .from('tuition_classroom_sessions')
        .select('id,course_id,tutor_id,title,description,scheduled_start,scheduled_end,meeting_url,meeting_provider,access_mode,recording_url,status,is_published')
        .in('id', ids)
        .eq('is_published', true)
        .order('scheduled_start', { ascending: true });

      if (error) throw error;

      const sessions = [];
      for (const item of data || []) sessions.push(await refreshStatus(item));

      return json({ sessions });
    }

    if (body.action === 'studentSession') {
      if (session.role !== 'student') {
        return json({ error: 'Student access required.' }, 403);
      }

      const studentId = currentUserId(session);
      if (!await studentSessionAllowed(studentId, body.sessionId)) {
        return json({ error: 'You are not enrolled for this class session.' }, 403);
      }

      const { data: classSession, error } = await db
        .from('tuition_classroom_sessions')
        .select('id,course_id,tutor_id,title,description,scheduled_start,scheduled_end,meeting_url,meeting_provider,access_mode,recording_url,status,is_published')
        .eq('id', body.sessionId)
        .eq('is_published', true)
        .maybeSingle();

      if (error) throw error;
      if (!classSession) return json({ error: 'Class session not found.' }, 404);

      await refreshStatus(classSession);

      const { data: resources, error: resourceError } = await db
        .from('tuition_classroom_resources')
        .select('id,title,resource_type,resource_url,description,is_published,created_at')
        .eq('session_id', body.sessionId)
        .eq('is_published', true)
        .order('created_at', { ascending: true });

      if (resourceError) throw resourceError;

      await db.from('tuition_classroom_events').insert({
        session_id: body.sessionId,
        student_id: studentId,
        event_type: 'opened',
      });

      return json({
        session: classSession,
        resources: resources || [],
      });
    }

    if (body.action === 'join') {
      if (session.role !== 'student') {
        return json({ error: 'Student access required.' }, 403);
      }

      const studentId = currentUserId(session);
      if (!await studentSessionAllowed(studentId, body.sessionId)) {
        return json({ error: 'You are not enrolled for this class session.' }, 403);
      }

      const { data: classSession, error } = await db
        .from('tuition_classroom_sessions')
        .select('*')
        .eq('id', body.sessionId)
        .eq('is_published', true)
        .maybeSingle();

      if (error) throw error;
      if (!classSession) return json({ error: 'Class session not found.' }, 404);

      await refreshStatus(classSession);

      if (classSession.status === 'cancelled') {
        return json({ error: 'This class has been cancelled.' }, 409);
      }

      await db
        .from('tuition_classroom_session_access')
        .update({ joined_at: new Date().toISOString() })
        .eq('session_id', body.sessionId)
        .eq('student_id', studentId);

      await db.from('tuition_classroom_events').insert({
        session_id: body.sessionId,
        student_id: studentId,
        event_type: 'joined',
      });

      return json({
        session: {
          id: classSession.id,
          title: classSession.title,
          status: classSession.status,
          accessMode: classSession.access_mode,
          meetingUrl: classSession.meeting_url,
          meetingProvider: classSession.meeting_provider,
          recordingUrl: classSession.recording_url,
        },
      });
    }

    if (body.action === 'tutorSessions') {
      if (session.role !== 'tutor') {
        return json({ error: 'Tutor access required.' }, 403);
      }

      const tutorId = currentUserId(session);

      const { data, error } = await db
        .from('tuition_classroom_sessions')
        .select('*')
        .eq('tutor_id', tutorId)
        .order('scheduled_start', { ascending: true });

      if (error) throw error;

      const sessions = [];
      for (const item of data || []) sessions.push(await refreshStatus(item));

      return json({ sessions });
    }

    if (body.action === 'createSession') {
      if (session.role !== 'tutor') {
        return json({ error: 'Tutor access required.' }, 403);
      }

      if (!body.title || !body.scheduledStart || !body.scheduledEnd) {
        return json({
          error: 'Title, start time and end time are required.',
        }, 400);
      }

      const tutorId = currentUserId(session);

      const { data, error } = await db
        .from('tuition_classroom_sessions')
        .insert({
          course_id: body.courseId || null,
          tutor_id: tutorId,
          title: body.title,
          description: body.description || null,
          scheduled_start: body.scheduledStart,
          scheduled_end: body.scheduledEnd,
          meeting_url: body.meetingUrl || null,
          meeting_provider: body.meetingProvider || null,
          access_mode: body.accessMode || 'link',
          recording_url: body.recordingUrl || null,
          status: 'scheduled',
          is_published: !!body.isPublished,
          created_by: tutorId,
        })
        .select()
        .single();

      if (error) throw error;
      return json({ session: data });
    }

    if (body.action === 'updateSession') {
      if (session.role !== 'tutor') {
        return json({ error: 'Tutor access required.' }, 403);
      }

      const tutorId = currentUserId(session);
      const owned = await tutorOwnsSession(tutorId, body.sessionId);
      if (!owned) return json({ error: 'Class session not found.' }, 404);

      const updates: Record<string, unknown> = {};
      const fields = [
        'title',
        'description',
        'scheduled_start',
        'scheduled_end',
        'meeting_url',
        'meeting_provider',
        'access_mode',
        'recording_url',
        'status',
        'is_published',
      ];

      for (const field of fields) {
        if (body[field] !== undefined) updates[field] = body[field];
      }

      updates.updated_at = new Date().toISOString();

      const { data, error } = await db
        .from('tuition_classroom_sessions')
        .update(updates)
        .eq('id', body.sessionId)
        .eq('tutor_id', tutorId)
        .select()
        .single();

      if (error) throw error;
      return json({ session: data });
    }

    if (body.action === 'addResource') {
      if (session.role !== 'tutor') {
        return json({ error: 'Tutor access required.' }, 403);
      }

      const tutorId = currentUserId(session);
      if (!await tutorOwnsSession(tutorId, body.sessionId)) {
        return json({ error: 'Class session not found.' }, 404);
      }

      if (!body.title || !body.resourceType) {
        return json({ error: 'Resource title and type are required.' }, 400);
      }

      const { data, error } = await db
        .from('tuition_classroom_resources')
        .insert({
          session_id: body.sessionId,
          title: body.title,
          resource_type: body.resourceType,
          resource_url: body.resourceUrl || null,
          description: body.description || null,
          is_published: body.isPublished !== false,
        })
        .select()
        .single();

      if (error) throw error;
      return json({ resource: data });
    }

    if (body.action === 'adminSessions') {
      if (session.role !== 'admin') {
        return json({ error: 'Admin access required.' }, 403);
      }

      const { data, error } = await db
        .from('tuition_classroom_sessions')
        .select('*')
        .order('scheduled_start', { ascending: true })
        .limit(500);

      if (error) throw error;
      return json({ sessions: data || [] });
    }

    return json({ error: 'Unknown action.' }, 400);
  } catch (error) {
    console.error('[tuition-classroom]', error);
    return json({
      error: error instanceof Error ? error.message : 'Unexpected error.',
    }, 500);
  }
});
