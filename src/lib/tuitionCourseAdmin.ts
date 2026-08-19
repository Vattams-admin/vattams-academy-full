import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/lib/supabase';

const ENDPOINT = `${SUPABASE_URL}/functions/v1/tuition-course-admin`;

async function call(action: string, payload: Record<string, unknown> = {}) {
  const token = sessionStorage.getItem('vattams_admin_token') || '';
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token || SUPABASE_ANON_KEY}`,
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ action, token, ...payload }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || 'Course operation failed.');
  return result;
}

export const createCourse = (payload: Record<string, unknown>) => call('createCourse', payload);
export const updateCourse = (payload: Record<string, unknown>) => call('updateCourse', payload);
export const createLevel = (payload: Record<string, unknown>) => call('createLevel', payload);
export const createModule = (payload: Record<string, unknown>) => call('createModule', payload);
export const createLesson = (payload: Record<string, unknown>) => call('createLesson', payload);
export const listCourseContent = (courseSlug: string) => call('listContent', { courseSlug });
