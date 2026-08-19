import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/lib/supabase';

const ENDPOINT = `${SUPABASE_URL}/functions/v1/tuition-guardians`;

function getToken() {
  return sessionStorage.getItem('vattams_guardian_token') || '';
}

async function call(action: string, payload: Record<string, unknown> = {}) {
  const token = getToken();

  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ action, token, ...payload }),
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || 'Guardian operation failed.');
  return result;
}

export const guardianLogin = (guardianId: string, accessCode: string) =>
  call('login', { guardianId, accessCode });

export const getGuardianDashboard = () => call('dashboard');

export const getGuardianStudents = () => call('students');

export const getGuardianProgress = (studentId: string) =>
  call('progress', { studentId });

export const getGuardianAttendance = (studentId: string) =>
  call('attendance', { studentId });

export const getGuardianCertificates = (studentId: string) =>
  call('certificates', { studentId });

export const getGuardianResults = (studentId: string) =>
  call('results', { studentId });

export const createGuardian = (payload: Record<string, unknown>) =>
  call('createGuardian', payload);

export const grantGuardianShare = (payload: Record<string, unknown>) =>
  call('grantShare', payload);

export const revokeGuardianShare = (shareId: string) =>
  call('revokeShare', { shareId });
