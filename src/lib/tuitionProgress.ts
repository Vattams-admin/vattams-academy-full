import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/lib/supabase';

const ENDPOINT = `${SUPABASE_URL}/functions/v1/tuition-progress`;

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
  if (!response.ok) throw new Error(result.error || 'Progress operation failed.');
  return result;
}

export const getMyProgress = (courseId?: string) =>
  call('myProgress', { courseId });

export const getMyResults = (courseId?: string) =>
  call('myResults', { courseId });

export const getStudentReport = (studentId: string, courseId?: string) =>
  call('studentReport', { studentId, courseId });

export const getTutorStudentReports = (courseId?: string) =>
  call('tutorReports', { courseId });

export const refreshProgress = (studentId: string, courseId: string) =>
  call('refreshProgress', { studentId, courseId });
