import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/lib/supabase';

const ENDPOINT = `${SUPABASE_URL}/functions/v1/tuition-communications`;

function getToken() {
  return (
    sessionStorage.getItem('vattams_admin_token') ||
    sessionStorage.getItem('vattams_tutor_token') ||
    sessionStorage.getItem('vattams_student_token') ||
    ''
  );
}

async function call(action: string, payload: Record<string, unknown> = {}) {
  const token = getToken();
  if (!token) throw new Error('Your session has expired. Please login again.');

  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ action, token, ...payload }),
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || 'Communication operation failed.');
  return result;
}

export const getMyNotifications = () => call('myNotifications');
export const markNotificationRead = (notificationId: string) =>
  call('markRead', { notificationId });
export const markAllNotificationsRead = () => call('markAllRead');

export const listAnnouncements = () => call('announcements');

export const createAnnouncement = (payload: Record<string, unknown>) =>
  call('createAnnouncement', payload);

export const publishAnnouncement = (announcementId: string) =>
  call('publishAnnouncement', { announcementId });

export const sendNotification = (payload: Record<string, unknown>) =>
  call('sendNotification', payload);
