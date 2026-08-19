import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/lib/supabase';

const ENDPOINT = `${SUPABASE_URL}/functions/v1/academy-security`;

export type AcademyRole = 'student' | 'tutor' | 'admin';

function getToken(role: AcademyRole) {
  const keys: Record<AcademyRole, string> = {
    student: 'vattams_student_token',
    tutor: 'vattams_tutor_token',
    admin: 'vattams_admin_token',
  };
  return sessionStorage.getItem(keys[role]) || '';
}

async function call(
  action: string,
  role: AcademyRole,
  payload: Record<string, unknown> = {},
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
    body: JSON.stringify({ action, role, token, ...payload }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Security request failed.');
  return data;
}

export const validateSession = (role: AcademyRole) =>
  call('validateSession', role);

export const recordSecurityEvent = (
  role: AcademyRole,
  eventType: string,
  metadata: Record<string, unknown> = {},
) => call('event', role, { eventType, metadata });

export const getSecuritySummary = () =>
  call('summary', 'admin');

export const cleanupExpiredSessions = () =>
  call('cleanupSessions', 'admin');
