// Data access layer for Vattams Online Tuition — Student Registration.
//
// Registration (public): direct insert into `tuition_students` using the
// anon key. The table's RLS only grants INSERT to anon/authenticated (see
// the tuition_students migration) — there is no public SELECT, so we
// verify success purely from the insert response (error present/absent),
// never by reading the row back. This mirrors submitTutorApplication in
// src/lib/tuitionTutors.ts.
//
// Admin (list / approve / reject) is handled directly by
// TuitionAdminStudents.tsx / TuitionAdminPanel.tsx via the
// admin_list_tuition_students / admin_update_tuition_student_status RPCs.

import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/lib/supabase';

export interface StudentRegistrationPayload {
  studentName: string;
  parentName: string;
  phone: string;
  email: string;
  city: string;
  course: string;
  mode: string;
  date: string;
  time: string;
  message: string;
  password: string;
}

const STUDENT_AUTH_URL = `${SUPABASE_URL}/functions/v1/tuition-student-auth`;

async function callStudentAuth(action: string, body: Record<string, unknown> = {}) {
  const response = await fetch(STUDENT_AUTH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ action, ...body }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || 'Student account request failed.');
  return result as Record<string, unknown>;
}

export interface StudentSessionProfile {
  id: string;
  student_id: string | null;
  student_name: string;
  parent_name: string;
  phone: string;
  email: string;
  city: string;
  course: string;
  class_mode: string;
  status: string;
  preferred_date: string | null;
  preferred_time: string | null;
}

const SESSION_KEY = 'vattams_student_session';

/**
 * Submits a student tuition registration. Resolves only once Supabase has
 * confirmed the row was actually written; rejects (with a readable
 * message) on any failure so the caller can avoid showing a false
 * "success" screen.
 */
export async function submitStudentRegistration(
  payload: StudentRegistrationPayload
): Promise<void> {
  await callStudentAuth('register', {
    studentName: payload.studentName.trim(),
    parentName: payload.parentName.trim(),
    phone: payload.phone.trim(),
    email: payload.email.trim().toLowerCase(),
    city: payload.city.trim(),
    course: payload.course.trim(),
    mode: payload.mode,
    date: payload.date || null,
    time: payload.time || null,
    message: payload.message?.trim() || null,
    password: payload.password,
  });
}

export async function loginStudent(email: string, password: string): Promise<StudentSessionProfile> {
  const result = await callStudentAuth('login', { email: email.trim().toLowerCase(), password });
  const token = typeof result.token === 'string' ? result.token : '';
  const student = result.student as StudentSessionProfile | undefined;
  if (!token || !student) throw new Error('Invalid student login response.');
  sessionStorage.setItem(SESSION_KEY, token);
  return student;
}

export async function getStudentSession(): Promise<StudentSessionProfile | null> {
  const token = sessionStorage.getItem(SESSION_KEY);
  if (!token) return null;
  try {
    const result = await callStudentAuth('me', { token });
    return (result.student as StudentSessionProfile) ?? null;
  } catch {
    sessionStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export async function logoutStudent(): Promise<void> {
  const token = sessionStorage.getItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
  if (!token) return;
  try { await callStudentAuth('logout', { token }); } catch { /* local logout already completed */ }
}
