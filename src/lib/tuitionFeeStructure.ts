import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/lib/supabase';

const ENDPOINT = `${SUPABASE_URL}/functions/v1/tuition-fee-structure`;

async function call(action: string, payload: Record<string, unknown> = {}) {
  const token =
    sessionStorage.getItem('vattams_admin_token') ||
    sessionStorage.getItem('vattams_tutor_token') ||
    sessionStorage.getItem('vattams_student_token') ||
    '';

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
  if (!response.ok) throw new Error(result.error || 'Fee operation failed.');
  return result;
}

export const listFeeStructures = () => call('fees');
export const listTutorPayoutRules = () => call('payoutRules');
export const getTutorJoiningFee = () => call('joiningFee');

export const adminCreateFee = (payload: Record<string, unknown>) =>
  call('adminCreateFee', payload);

export const adminUpdateFee = (id: string, payload: Record<string, unknown>) =>
  call('adminUpdateFee', { id, ...payload });

export const adminUpdatePayoutRule = (
  id: string,
  payload: Record<string, unknown>,
) => call('adminUpdatePayoutRule', { id, ...payload });
