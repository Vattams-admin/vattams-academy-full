import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/lib/supabase';

const ENDPOINT = `${SUPABASE_URL}/functions/v1/tuition-payments`;

async function call(action: string, payload: Record<string, unknown> = {}) {
  const token =
    sessionStorage.getItem('vattams_admin_token') ||
    sessionStorage.getItem('vattams_tutor_token') ||
    sessionStorage.getItem('vattams_student_token') ||
    '';

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
  if (!response.ok) throw new Error(result.error || 'Payment operation failed.');
  return result;
}

export const getPaymentSettings = () => call('settings');
export const createPayment = (payload: Record<string, unknown>) =>
  call('create', payload);
export const submitPaymentProof = (payload: Record<string, unknown>) =>
  call('submitProof', payload);
export const listMyPayments = () => call('myPayments');
export const listAdminPayments = () => call('adminList');
export const verifyPayment = (id: string, status: 'verified' | 'rejected', notes?: string) =>
  call('verify', { id, status, notes });
