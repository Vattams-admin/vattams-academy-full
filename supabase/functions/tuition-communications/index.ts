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

function audienceMatches(audience: string, role: string) {
  return (
    audience === 'all' ||
    (audience === 'students' && role === 'student') ||
    (audience === 'tutors' && role === 'tutor') ||
    (audience === 'admins' && role === 'admin')
  );
}

async function notify(
  recipientId: string,
  recipientRole: string,
  title: string,
  message: string,
  type = 'general',
  actionUrl?: string,
  referenceId?: string,
) {
  const { error } = await db.from('tuition_user_notifications').insert({
    recipient_id: recipientId,
    recipient_role: recipientRole,
    title,
    message,
    notification_type: type,
    action_url: actionUrl || null,
    reference_id: referenceId || null,
  });
  if (error) throw error;
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

    if (body.action === 'myNotifications') {
      const { data, error } = await db
        .from('tuition_user_notifications')
        .select('*')
        .eq('recipient_id', user.user_id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      return json({
        notifications: data || [],
        unreadCount: (data || []).filter((n: any) => !n.is_read).length,
      });
    }

    if (body.action === 'markRead') {
      const { data, error } = await db
        .from('tuition_user_notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq('id', body.notificationId)
        .eq('recipient_id', user.user_id)
        .select()
        .maybeSingle();

      if (error) throw error;
      return json({ notification: data });
    }

    if (body.action === 'markAllRead') {
      const { error } = await db
        .from('tuition_user_notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq('recipient_id', user.user_id)
        .eq('is_read', false);

      if (error) throw error;
      return json({ success: true });
    }

    if (body.action === 'announcements') {
      const now = new Date().toISOString();

      const { data, error } = await db
        .from('tuition_announcements')
        .select('*')
        .eq('status', 'published')
        .lte('publish_at', now)
        .order('publish_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const visible = (data || []).filter((a: any) => {
        if (a.expires_at && new Date(a.expires_at).getTime() < Date.now()) return false;
        if (a.audience === 'course') return false;
        return audienceMatches(a.audience, user.role);
      });

      return json({ announcements: visible });
    }

    if (body.action === 'createAnnouncement') {
      if (user.role !== 'admin') {
        return json({ error: 'Admin access required.' }, 403);
      }

      if (!body.title || !body.message) {
        return json({ error: 'Title and message are required.' }, 400);
      }

      const { data, error } = await db
        .from('tuition_announcements')
        .insert({
          title: body.title,
          message: body.message,
          audience: body.audience || 'all',
          course_id: body.courseId || null,
          priority: body.priority || 'normal',
          publish_at: body.publishAt || new Date().toISOString(),
          expires_at: body.expiresAt || null,
          status: 'draft',
          created_by: user.user_id,
        })
        .select()
        .single();

      if (error) throw error;
      return json({ announcement: data });
    }

    if (body.action === 'publishAnnouncement') {
      if (user.role !== 'admin') {
        return json({ error: 'Admin access required.' }, 403);
      }

      const { data: announcement, error: getError } = await db
        .from('tuition_announcements')
        .select('*')
        .eq('id', body.announcementId)
        .maybeSingle();

      if (getError) throw getError;
      if (!announcement) return json({ error: 'Announcement not found.' }, 404);

      const { data, error } = await db
        .from('tuition_announcements')
        .update({
          status: 'published',
          updated_at: new Date().toISOString(),
        })
        .eq('id', announcement.id)
        .select()
        .single();

      if (error) throw error;

      // Fan-out to the role audience. Course-targeted notifications are
      // intentionally left for course-enrollment integration in a later phase.
      const roleMap =
        announcement.audience === 'students'
          ? ['student']
          : announcement.audience === 'tutors'
            ? ['tutor']
            : announcement.audience === 'admins'
              ? ['admin']
              : ['student', 'tutor', 'admin'];

      for (const role of roleMap) {
        let table = '';
        if (role === 'student') table = 'tuition_students';
        if (role === 'tutor') table = 'tuition_tutors';
        if (role === 'admin') table = 'admins';

        const { data: users, error: userError } = await db
          .from(table)
          .select('id')
          .limit(5000);

        if (userError) throw userError;

        for (const recipient of users || []) {
          await notify(
            recipient.id,
            role,
            announcement.title,
            announcement.message,
            'announcement',
            '/announcements',
            announcement.id,
          );
        }
      }

      return json({ announcement: data });
    }

    if (body.action === 'sendNotification') {
      if (!['admin', 'tutor'].includes(user.role)) {
        return json({ error: 'Tutor/Admin access required.' }, 403);
      }

      if (!body.recipientId || !body.recipientRole || !body.title || !body.message) {
        return json({ error: 'Recipient, title and message are required.' }, 400);
      }

      await notify(
        body.recipientId,
        body.recipientRole,
        body.title,
        body.message,
        body.notificationType || 'general',
        body.actionUrl,
        body.referenceId,
      );

      return json({ success: true });
    }

    return json({ error: 'Unknown action.' }, 400);
  } catch (error) {
    console.error('[tuition-communications]', error);
    return json(
      { error: error instanceof Error ? error.message : 'Unexpected error.' },
      500,
    );
  }
});
