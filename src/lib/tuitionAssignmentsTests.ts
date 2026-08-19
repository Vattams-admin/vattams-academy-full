import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/lib/supabase';

const ENDPOINT = `${SUPABASE_URL}/functions/v1/tuition-assignments-tests`;

function token(role: 'student' | 'tutor' | 'admin') {
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
  const auth = token(role);
  if (!auth) throw new Error('Your session has expired. Please login again.');

  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${auth}`,
    },
    body: JSON.stringify({ action, token: auth, ...payload }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Learning activity request failed.');
  return data;
}

export const getStudentAssignments = () => call('studentAssignments');
export const submitAssignment = (payload: Record<string, unknown>) =>
  call('submitAssignment', payload);

export const getStudentTests = () => call('studentTests');
export const getTest = (testId: string) => call('studentTest', { testId });
export const startTest = (testId: string) => call('startTest', { testId });
export const submitTest = (payload: Record<string, unknown>) =>
  call('submitTest', payload);

export const getTutorAssignments = () => call('tutorAssignments', {}, 'tutor');
export const createAssignment = (payload: Record<string, unknown>) =>
  call('createAssignment', payload, 'tutor');
export const reviewAssignment = (payload: Record<string, unknown>) =>
  call('reviewAssignment', payload, 'tutor');

export const getTutorTests = () => call('tutorTests', {}, 'tutor');
export const createTest = (payload: Record<string, unknown>) =>
  call('createTest', payload, 'tutor');
export const addTestQuestion = (payload: Record<string, unknown>) =>
  call('addTestQuestion', payload, 'tutor');
