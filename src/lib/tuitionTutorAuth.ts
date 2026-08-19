import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/lib/supabase';

const TUTOR_AUTH_URL = `${SUPABASE_URL}/functions/v1/tuition-tutor-auth`;
const SESSION_KEY = 'vattams_tutor_session';

export interface TutorSessionProfile {
  id: string;
  employee_id: string | null;
  full_name: string;
  email: string;
  phone: string;
  city: string;
  state: string | null;
  highest_qualification: string;
  subjects: string[];
  exam_prep: string[];
  teaching_mode: string | null;
  availability: string | null;
  status: string;
  approval_status: string;
  payment_status: string;
}

async function callTutorAuth(action: string, body: Record<string, unknown> = {}) {
  const response = await fetch(TUTOR_AUTH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${SUPABASE_ANON_KEY}`, apikey: SUPABASE_ANON_KEY },
    body: JSON.stringify({ action, ...body }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || 'Tutor account request failed.');
  return result as Record<string, unknown>;
}

export async function loginTutor(email: string, password: string): Promise<TutorSessionProfile> {
  const result = await callTutorAuth('login', { email: email.trim().toLowerCase(), password });
  const token = typeof result.token === 'string' ? result.token : '';
  const tutor = result.tutor as TutorSessionProfile | undefined;
  if (!token || !tutor) throw new Error('Invalid tutor login response.');
  sessionStorage.setItem(SESSION_KEY, token);
  return tutor;
}

export async function getTutorSession(): Promise<TutorSessionProfile | null> {
  const token = sessionStorage.getItem(SESSION_KEY);
  if (!token) return null;
  try {
    const result = await callTutorAuth('me', { token });
    return (result.tutor as TutorSessionProfile) ?? null;
  } catch {
    sessionStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export async function logoutTutor(): Promise<void> {
  const token = sessionStorage.getItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
  if (!token) return;
  try { await callTutorAuth('logout', { token }); } catch { /* local logout already completed */ }
}
