import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/lib/supabase';

const ENDPOINT = `${SUPABASE_URL}/functions/v1/tuition-assessments`;

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
  if (!response.ok) {
    throw new Error(result.error || 'Assessment operation failed.');
  }
  return result;
}

export const createAssignment = (payload: Record<string, unknown>) =>
  call('createAssignment', payload);

export const listAssignments = (courseId?: string) =>
  call('listAssignments', { courseId });

export const submitAssignment = (payload: Record<string, unknown>) =>
  call('submitAssignment', payload);

export const reviewAssignment = (payload: Record<string, unknown>) =>
  call('reviewAssignment', payload);

export const createTest = (payload: Record<string, unknown>) =>
  call('createTest', payload);

export const addTestQuestion = (payload: Record<string, unknown>) =>
  call('addTestQuestion', payload);

export const listTests = (courseId?: string) =>
  call('listTests', { courseId });

export const startTest = (testId: string) =>
  call('startTest', { testId });

export const submitTest = (payload: Record<string, unknown>) =>
  call('submitTest', payload);

export const listMyTestAttempts = (testId?: string) =>
  call('myAttempts', { testId });

export const listTestResults = (testId?: string) =>
  call('adminResults', { testId });
