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

async function sessionFor(token: string) {
  if (!token) return null;

  for (const [table, role] of sessionTables) {
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
  return session.student_id || session.tutor_id || session.admin_id ||
    session.user_id || session.id;
}

function roleAudience(role: string) {
  if (role === 'student') return 'students';
  if (role === 'tutor') return 'tutors';
  return 'admins';
}

async function removeExpiredFor(userRole: string, userId: string) {
  const now = new Date().toISOString();
  await db
    .from('tuition_notifications')
    .delete()
    .eq('recipient_role', userRole)
    .eq('recipient_id', userId)
    .lt('expires_at', now);
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

    const role = session.role;
    const userId = currentUserId(session);

    if (body.action === 'list') {
      await removeExpiredFor(role, userId);

      const { data: direct, error: directError } = await db
        .from('tuition_notifications')
        .select('*')
        .eq('recipient_role', role)
        .eq('recipient_id', userId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (directError) throw directError;

      const { data: broadcast, error: broadcastError } = await db
        .from('tuition_notifications')
        .select('*')
        .eq('recipient_role', 'all')
        .order('created_at', { ascending: false })
        .limit(100);

      if (broadcastError) throw broadcastError;

      const { data: announcements, error: announcementError } = await db
        .from('tuition_announcements')
        .select('id,title,message,audience,priority,publish_at,expires_at,status,created_at')
        .eq('status', 'published')
        .lte('publish_at', new Date().toISOString())
        .order('publish_at', { ascending: false })
        .limit(50);

      if (announcementError) throw announcementError;

      const audience = roleAudience(role);
      const filteredAnnouncements = (announcements || []).filter((item: any) => {
        if (!item.expires_at) return item.audience === 'all' || item.audience === audience;
        return new Date(item.expires_at).getTime() > Date.now() &&
          (item.audience === 'all' || item.audience === audience);
      });

      const items = [
        ...(direct || []),
        ...(broadcast || []),
        ...filteredAnnouncements.map((item: any) => ({
          id: `announcement-${item.id}`,
          announcement_id: item.id,
          recipient_role: role,
          recipient_id: userId,
          notification_type: 'announcement',
          title: item.title,
          message: item.message,
          priority: item.priority,
          is_read: false,
          created_at: item.created_at,
          action_page: null,
          action_id: null,
        })),
      ].sort((a: any, b: any) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      const unique = Array.from(
        new Map(items.map((item: any) => [item.id, item])).values()
      ).slice(0, 100);

      return json({
        notifications: unique,
        unreadCount: unique.filter((item: any) => !item.is_read).length,
      });
    }

    if (body.action === 'markRead') {
      const { data, error } = await db
        .from('tuition_notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq('id', body.notificationId)
        .eq('recipient_role', role)
        .eq('recipient_id', userId)
        .select()
        .maybeSingle();

      if (error) throw error;

      return json({ notification: data });
    }

    if (body.action === 'markAllRead') {
      const { error } = await db
        .from('tuition_notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq('recipient_role', role)
        .eq('recipient_id', userId)
        .eq('is_read', false);

      if (error) throw error;
      return json({ success: true });
    }

    if (body.action === 'preferences') {
      const { data, error } = await db
        .from('tuition_notification_preferences')
        .select('*')
        .eq('user_role', role)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;

      return json({
        preferences: data || {
          user_role: role,
          user_id: userId,
          in_app_enabled: true,
          class_enabled: true,
          assignment_enabled: true,
          test_enabled: true,
          competition_enabled: true,
          certificate_enabled: true,
          attendance_enabled: true,
          payment_enabled: true,
          announcement_enabled: true,
        },
      });
    }

    if (body.action === 'updatePreferences') {
      const allowed = [
        'in_app_enabled',
        'class_enabled',
        'assignment_enabled',
        'test_enabled',
        'competition_enabled',
        'certificate_enabled',
        'attendance_enabled',
        'payment_enabled',
        'announcement_enabled',
      ];

      const clean: Record<string, boolean> = {};
      for (const key of allowed) {
        if (typeof body.preferences?.[key] === 'boolean') {
          clean[key] = body.preferences[key];
        }
      }

      const { data, error } = await db
        .from('tuition_notification_preferences')
        .upsert({
          user_role: role,
          user_id: userId,
          ...clean,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_role,user_id' })
        .select()
        .single();

      if (error) throw error;
      return json({ preferences: data });
    }

    if (body.action === 'createAnnouncement') {
      if (role !== 'admin') return json({ error: 'Admin access required.' }, 403);

      if (!body.title || !body.message) {
        return json({ error: 'Title and message are required.' }, 400);
      }

      const { data, error } = await db
        .from('tuition_announcements')
        .insert({
          title: body.title,
          message: body.message,
          audience: body.audience || 'all',
          priority: body.priority || 'normal',
          publish_at: body.publishAt || new Date().toISOString(),
          expires_at: body.expiresAt || null,
          status: body.status || 'draft',
          created_by: userId,
        })
        .select()
        .single();

      if (error) throw error;
      return json({ announcement: data });
    }

    if (body.action === 'adminAnnouncements') {
      if (role !== 'admin') return json({ error: 'Admin access required.' }, 403);

      const { data, error } = await db
        .from('tuition_announcements')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);

      if (error) throw error;
      return json({ announcements: data || [] });
    }

    if (body.action === 'publishAnnouncement') {
      if (role !== 'admin') return json({ error: 'Admin access required.' }, 403);

      const { data, error } = await db
        .from('tuition_announcements')
        .update({
          status: 'published',
          publish_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', body.announcementId)
        .select()
        .single();

      if (error) throw error;
      return json({ announcement: data });
    }

    if (body.action === 'createNotification') {
      if (role !== 'admin') return json({ error: 'Admin access required.' }, 403);

      if (!body.title || !body.message || !body.recipientRole) {
        return json({ error: 'Recipient role, title and message are required.' }, 400);
      }

      const recipientRole = String(body.recipientRole);
      if (!['student', 'tutor', 'admin', 'all'].includes(recipientRole)) {
        return json({ error: 'Invalid recipient role.' }, 400);
      }

      const { data, error } = await db
        .from('tuition_notifications')
        .insert({
          recipient_role: recipientRole,
          recipient_id: recipientRole === 'all' ? null : body.recipientId || null,
          notification_type: body.notificationType || 'general',
          title: body.title,
          message: body.message,
          action_page: body.actionPage || null,
          action_id: body.actionId || null,
          priority: body.priority || 'normal',
          expires_at: body.expiresAt || null,
        })
        .select()
        .single();

      if (error) throw error;
      return json({ notification: data });
    }

    return json({ error: 'Unknown action.' }, 400);
  } catch (error) {
    console.error('[tuition-notifications]', error);
    return json({
      error: error instanceof Error ? error.message : 'Unexpected error.',
    }, 500);
  }
});
