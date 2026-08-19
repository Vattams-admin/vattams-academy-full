import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/lib/supabase';

const ENDPOINT = `${SUPABASE_URL}/functions/v1/tuition-notifications`;

function getToken(role: 'student' | 'tutor' | 'admin') {
  return sessionStorage.getItem({
    student: 'vattams_student_token',
    tutor: 'vattams_tutor_token',
    admin: 'vattams_admin_token',
  }[role]) || '';
}

async function call(
  action: string,
  payload: Record<string, unknown> = {},
  role: 'student' | 'tutor' | 'admin' = 'student',
) {
  const token = getToken(role);
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

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Notification request failed.');
  return data;
}

export const getStudentNotifications = () => call('list', {}, 'student');
export const getTutorNotifications = () => call('list', {}, 'tutor');
export const getAdminNotifications = () => call('list', {}, 'admin');

export const markNotificationRead = (notificationId: string, role: 'student' | 'tutor' | 'admin' = 'student') =>
  call('markRead', { notificationId }, role);

export const markAllNotificationsRead = (role: 'student' | 'tutor' | 'admin' = 'student') =>
  call('markAllRead', {}, role);

export const getNotificationPreferences = (role: 'student' | 'tutor' | 'admin' = 'student') =>
  call('preferences', {}, role);

export const updateNotificationPreferences = (
  preferences: Record<string, unknown>,
  role: 'student' | 'tutor' | 'admin' = 'student',
) => call('updatePreferences', { preferences }, role);

export const createAnnouncement = (payload: Record<string, unknown>) =>
  call('createAnnouncement', payload, 'admin');

export const getAdminAnnouncements = () =>
  call('adminAnnouncements', {}, 'admin');

export const publishAnnouncement = (announcementId: string) =>
  call('publishAnnouncement', { announcementId }, 'admin');

export const createNotification = (payload: Record<string, unknown>) =>
  call('createNotification', payload, 'admin');
