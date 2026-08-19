import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/lib/supabase';

const ENDPOINT = `${SUPABASE_URL}/functions/v1/academy-backup`;

function adminToken() {
  return sessionStorage.getItem('vattams_admin_token') || '';
}

async function call(action: string, payload: Record<string, unknown> = {}) {
  const token = adminToken();
  if (!token) throw new Error('Admin session required.');

  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ action, token, ...payload }),
    cache: 'no-store',
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Backup request failed.');
  return data;
}

export const getBackupReadiness = () => call('readiness');
export const getBackupManifest = () => call('manifest');
export const createBackupManifest = (payload: Record<string, unknown> = {}) =>
  call('createManifest', payload);
export const getRecoveryChecklist = () => call('recoveryChecklist');
