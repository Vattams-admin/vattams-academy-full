import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/lib/supabase';

const ENDPOINT = `${SUPABASE_URL}/functions/v1/tuition-enrollment`;

function token() {
  return (
    sessionStorage.getItem('vattams_admin_token') ||
    sessionStorage.getItem('vattams_tutor_token') ||
    sessionStorage.getItem('vattams_student_token') ||
    ''
  );
}

async function call(action: string, payload: Record<string, unknown> = {}) {
  const sessionToken = token();
  if (!sessionToken) throw new Error('Your session has expired. Please login again.');

  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${sessionToken}`,
    },
    body: JSON.stringify({ action, token: sessionToken, ...payload }),
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || 'Enrollment operation failed.');
  return result;
}

export const createEnrollment = (payload: Record<string, unknown>) =>
  call('create', payload);

export const listMyEnrollments = () => call('myEnrollments');

export const getCourseAccess = (courseId: string) =>
  call('courseAccess', { courseId });

export const listAdminEnrollments = () => call('adminList');

export const activateEnrollment = (id: string) =>
  call('activate', { id });

export const pauseEnrollment = (id: string) =>
  call('pause', { id });

export const completeEnrollment = (id: string) =>
  call('complete', { id });

export const cancelEnrollment = (id: string, notes?: string) =>
  call('cancel', { id, notes });
