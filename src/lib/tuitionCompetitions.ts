import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/lib/supabase';

const ENDPOINT = `${SUPABASE_URL}/functions/v1/tuition-competitions`;

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
  if (!response.ok) throw new Error(data.error || 'Competition request failed.');
  return data;
}

export const getStudentCompetitions = () => call('studentCompetitions');
export const getCompetition = (competitionId: string) =>
  call('studentCompetition', { competitionId });
export const registerCompetition = (competitionId: string) =>
  call('register', { competitionId });
export const startCompetition = (competitionId: string) =>
  call('start', { competitionId });
export const submitCompetition = (payload: Record<string, unknown>) =>
  call('submit', payload);
export const getLeaderboard = (competitionId: string) =>
  call('leaderboard', { competitionId });

export const getTutorCompetitions = () => call('tutorCompetitions', {}, 'tutor');
export const createCompetition = (payload: Record<string, unknown>) =>
  call('createCompetition', payload, 'tutor');
export const addCompetitionQuestion = (payload: Record<string, unknown>) =>
  call('addQuestion', payload, 'tutor');

export const getAdminCompetitions = () => call('adminCompetitions', {}, 'admin');
