import {
  validateSession,
  type AcademyRole,
} from '@/lib/academySecurity';

const TOKEN_KEYS: Record<AcademyRole, string> = {
  student: 'vattams_student_token',
  tutor: 'vattams_tutor_token',
  admin: 'vattams_admin_token',
};

export function hasLocalAcademySession(role: AcademyRole) {
  return Boolean(sessionStorage.getItem(TOKEN_KEYS[role]));
}

export function clearAcademySession(role: AcademyRole) {
  sessionStorage.removeItem(TOKEN_KEYS[role]);
}

export async function verifyAcademySession(role: AcademyRole) {
  if (!hasLocalAcademySession(role)) return false;

  try {
    const result = await validateSession(role);
    return result.valid === true;
  } catch {
    clearAcademySession(role);
    return false;
  }
}

export function academyLogout(role: AcademyRole) {
  clearAcademySession(role);
  window.location.hash = '#/home';
}
