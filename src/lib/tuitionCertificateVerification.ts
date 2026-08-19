import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/lib/supabase';

const ENDPOINT = `${SUPABASE_URL}/functions/v1/tuition-certificate-verification`;

async function call(action: string, payload: Record<string, unknown> = {}, token = '') {
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
  if (!response.ok) throw new Error(result.error || 'Certificate verification failed.');
  return result;
}

export const verifyCertificate = (certificateNumber: string, verificationCode?: string) =>
  call('verify', { certificateNumber, verificationCode });

export const createCertificateVerification = (
  certificateId: string,
  token: string,
) => call('create', { certificateId }, token);

export const revokeCertificateVerification = (
  verificationId: string,
  reason: string,
  token: string,
) => call('revoke', { verificationId, reason }, token);
