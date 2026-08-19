import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/lib/supabase';

const ENDPOINT = `${SUPABASE_URL}/functions/v1/tuition-material-admin`;

async function call(action: string, payload: Record<string, unknown> = {}) {
  const token = sessionStorage.getItem('vattams_admin_token') || '';
  if (!token) throw new Error('Admin session expired. Please login again.');

  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ action, token, ...payload }),
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || 'Material operation failed.');
  return result;
}

export interface AdminMaterial {
  id: string;
  course_slug: string;
  title: string;
  description: string | null;
  category: string;
  subject: string | null;
  topic: string | null;
  grade: string | null;
  resource_url: string | null;
  external_url: string | null;
  file_type: string | null;
  file_size: number | null;
  is_published: boolean;
  created_at: string;
}

export const listMaterials = (courseSlug?: string) =>
  call('list', courseSlug ? { courseSlug } : {});

export const setMaterialPublished = (id: string, isPublished: boolean) =>
  call('setPublished', { id, isPublished });

export const deleteMaterial = (id: string) =>
  call('delete', { id });

export const createExternalMaterial = (payload: {
  courseSlug: string;
  title: string;
  description?: string;
  category: string;
  subject?: string;
  topic?: string;
  grade?: string;
  externalUrl: string;
  isPublished: boolean;
}) => call('createExternal', payload);

export async function uploadPdfMaterial(payload: {
  courseSlug: string;
  title: string;
  description?: string;
  category: string;
  subject?: string;
  topic?: string;
  grade?: string;
  file: File;
  isPublished: boolean;
}) {
  if (payload.file.type !== 'application/pdf') {
    throw new Error('Only PDF files are supported for protected uploads.');
  }
  if (payload.file.size > 50 * 1024 * 1024) {
    throw new Error('PDF must be 50 MB or smaller.');
  }

  const buffer = await payload.file.arrayBuffer();
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, Math.min(i + chunk, bytes.length)));
  }

  return call('uploadPdf', {
    courseSlug: payload.courseSlug,
    title: payload.title,
    description: payload.description || '',
    category: payload.category,
    subject: payload.subject || '',
    topic: payload.topic || '',
    grade: payload.grade || '',
    fileName: payload.file.name,
    fileBase64: btoa(binary),
    isPublished: payload.isPublished,
  });
}
