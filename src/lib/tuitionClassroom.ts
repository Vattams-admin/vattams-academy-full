import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/lib/supabase';

const ENDPOINT = `${SUPABASE_URL}/functions/v1/tuition-classroom`;

function getToken(role: 'student' | 'tutor' | 'admin') {
  const key = {
    student: 'vattams_student_token',
    tutor: 'vattams_tutor_token',
    admin: 'vattams_admin_token',
  }[role];

  return sessionStorage.getItem(key) || '';
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

  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || 'Classroom operation failed.');
  return result;
}

export const getStudentClassroom = () => call('studentSessions');
export const getStudentSession = (sessionId: string) =>
  call('studentSession', { sessionId });
export const joinStudentSession = (sessionId: string) =>
  call('join', { sessionId });

export const getTutorClassroom = () => call('tutorSessions', {}, 'tutor');
export const createClassroomSession = (payload: Record<string, unknown>) =>
  call('createSession', payload, 'tutor');
export const updateClassroomSession = (payload: Record<string, unknown>) =>
  call('updateSession', payload, 'tutor');
export const addClassroomResource = (payload: Record<string, unknown>) =>
  call('addResource', payload, 'tutor');

export const getAdminClassroom = () => call('adminSessions', {}, 'admin');
