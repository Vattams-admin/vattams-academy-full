import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/lib/supabase';

const ENDPOINT = `${SUPABASE_URL}/functions/v1/tuition-classroom`;

export interface ClassroomStudent {
  id: string;
  student_name: string;
  [key: string]: unknown;
}

export interface ClassroomRecord {
  id: string;
  courseName: string;
  subject: string;
  classGrade: string;
  board?: string;
  tutorId?: string;
  tutorName: string;
  date: string;
  startTime: string;
  endTime: string;
  mode?: string;
  meetingProvider?: string;
  meetingUrl?: string;
  status: string;
  students: ClassroomStudent[];
  [key: string]: unknown;
}

export interface AdminClassroomResult {
  classes: ClassroomRecord[];
  tutors: Array<{
    id: string;
    full_name: string;
    [key: string]: unknown;
  }>;
  students: ClassroomStudent[];
  [key: string]: unknown;
}

function getToken(role: 'student' | 'tutor' | 'admin') {
  const key = {
    student: 'vattams_student_token',
    tutor: 'vattams_tutor_token',
    admin: 'vattams_admin_token',
  }[role];

  return sessionStorage.getItem(key) || '';
}

async function call(
  action: string,
  payload: Record<string, unknown> = {},
  role: 'student' | 'tutor' | 'admin' = 'student',
) {
  const token = getToken(role);

  if (!token) {
    throw new Error('Your session has expired. Please login again.');
  }

  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      action,
      token,
      ...payload,
    }),
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      result.error || 'Classroom operation failed.',
    );
  }

  return result;
}

/* =========================================================
   STUDENT
   ========================================================= */

export const getStudentClassroom = () =>
  call('studentSessions');

export const getStudentSession = (sessionId: string) =>
  call('studentSession', { sessionId });

export const joinStudentSession = (sessionId: string) =>
  call('join', { sessionId });

/* =========================================================
   TUTOR
   ========================================================= */

export const getTutorClassroom = () =>
  call('tutorSessions', {}, 'tutor');

export const createClassroomSession = (
  payload: Record<string, unknown>,
) =>
  call(
    'createSession',
    payload,
    'tutor',
  );

export const updateClassroomSession = (
  payload: Record<string, unknown>,
) =>
  call(
    'updateSession',
    payload,
    'tutor',
  );

export const addClassroomResource = (
  payload: Record<string, unknown>,
) =>
  call(
    'addResource',
    payload,
    'tutor',
  );

/* =========================================================
   ADMIN
   ========================================================= */

export const getAdminClassroom = () =>
  call(
    'adminSessions',
    {},
    'admin',
  );

/*
 * Admin classroom list
 *
 * TuitionAdminClasses.tsx expects:
 *   result.classes
 *   result.tutors
 *   result.students
 */
export const listClasses = async (
  role: 'admin' = 'admin',
): Promise<AdminClassroomResult> => {
  const result = await call(
    'adminSessions',
    {},
    role,
  );

  return {
    classes: Array.isArray(result.classes)
      ? result.classes
      : [],

    tutors: Array.isArray(result.tutors)
      ? result.tutors
      : [],

    students: Array.isArray(result.students)
      ? result.students
      : [],
  };
};

/*
 * Admin create class
 *
 * Keep the action separate from the existing tutor
 * createClassroomSession() so the existing tutor flow
 * is not changed.
 */
export const createClass = (
  payload: Record<string, unknown>,
) =>
  call(
    'createClass',
    payload,
    'admin',
  );