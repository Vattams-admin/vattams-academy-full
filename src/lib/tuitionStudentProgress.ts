import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/lib/supabase';

const ENDPOINT = `${SUPABASE_URL}/functions/v1/tuition-student-progress`;

function tokenFor(role: 'student' | 'tutor' | 'admin' | 'guardian') {
  const key = {
    student: 'vattams_student_token',
    tutor: 'vattams_tutor_token',
    admin: 'vattams_admin_token',
    guardian: 'vattams_guardian_token',
  }[role];
  return sessionStorage.getItem(key) || '';
}

async function call(
  action: string,
  payload: Record<string, unknown> = {},
  role: 'student' | 'tutor' | 'admin' | 'guardian' = 'student',
) {
  const token = tokenFor(role);
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
  if (!response.ok) throw new Error(result.error || 'Progress request failed.');
  return result;
}

export const getMyProgress = () => call('myProgress');
export const getMyProgressHistory = (days = 30) =>
  call('myHistory', { days });

export const getStudentProgress = (studentId: string) =>
  call('studentProgress', { studentId }, 'admin');

export const getStudentProgressHistory = (studentId: string, days = 30) =>
  call('studentHistory', { studentId, days }, 'admin');

export const refreshStudentProgress = (studentId: string, snapshotDate?: string) =>
  call('refreshSnapshot', { studentId, snapshotDate }, 'admin');
