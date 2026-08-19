import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/lib/supabase';

const ENDPOINT = `${SUPABASE_URL}/functions/v1/tuition-certificates`;

function token(role: 'student' | 'admin') {
  return sessionStorage.getItem({
    student: 'vattams_student_token',
    admin: 'vattams_admin_token',
  }[role]) || '';
}

async function call(
  action: string,
  payload: Record<string, unknown> = {},
  role: 'student' | 'admin' = 'student',
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
  if (!response.ok) throw new Error(data.error || 'Certificate request failed.');
  return data;
}

export const getStudentCertificates = () => call('studentCertificates');

export const verifyCertificate = async (verificationToken: string) => {
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      action: 'verify',
      verificationToken,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Certificate verification failed.');
  return data;
};

export const createCertificate = (payload: Record<string, unknown>) =>
  call('create', payload, 'admin');

export const revokeCertificate = (certificateId: string) =>
  call('revoke', { certificateId }, 'admin');
