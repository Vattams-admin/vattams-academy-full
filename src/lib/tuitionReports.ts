import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/lib/supabase';

const ENDPOINT = `${SUPABASE_URL}/functions/v1/tuition-reports`;

function token() {
  return sessionStorage.getItem('vattams_admin_token') || '';
}

async function call(action: string, payload: Record<string, unknown> = {}) {
  const auth = token();
  if (!auth) throw new Error('Your admin session has expired. Please login again.');

  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${auth}`,
    },
    body: JSON.stringify({ action, token: auth, ...payload }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Report request failed.');
  return data;
}

export const getDashboardReport = (periodStart?: string, periodEnd?: string) =>
  call('dashboard', { periodStart, periodEnd });

export const getStudentProgressReport = (payload: Record<string, unknown> = {}) =>
  call('studentProgress', payload);

export const getTutorPerformanceReport = (payload: Record<string, unknown> = {}) =>
  call('tutorPerformance', payload);

export const getCoursePerformanceReport = (payload: Record<string, unknown> = {}) =>
  call('coursePerformance', payload);

export const getAttendanceReport = (payload: Record<string, unknown> = {}) =>
  call('attendance', payload);

export const getAssessmentReport = (payload: Record<string, unknown> = {}) =>
  call('assessments', payload);

export const getCompetitionReport = (payload: Record<string, unknown> = {}) =>
  call('competitions', payload);

export const getCertificateReport = (payload: Record<string, unknown> = {}) =>
  call('certificates', payload);

export const saveReportSnapshot = (payload: Record<string, unknown>) =>
  call('saveSnapshot', payload);

export const getReportSnapshots = (reportType?: string) =>
  call('snapshots', { reportType });
