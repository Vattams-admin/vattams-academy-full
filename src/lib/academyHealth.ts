import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/lib/supabase';

export type HealthStatus = 'ok' | 'warning' | 'error';

export type HealthCheck = {
  name: string;
  status: HealthStatus;
  message: string;
  durationMs: number;
};

async function timed(name: string, fn: () => Promise<HealthCheck>): Promise<HealthCheck> {
  const started = performance.now();
  try {
    const result = await fn();
    return {
      ...result,
      name,
      durationMs: Math.round(performance.now() - started),
    };
  } catch (error) {
    return {
      name,
      status: 'error',
      message: error instanceof Error ? error.message : 'Health check failed.',
      durationMs: Math.round(performance.now() - started),
    };
  }
}

export async function runPublicHealthChecks(): Promise<HealthCheck[]> {
  const checks: HealthCheck[] = [];

  checks.push({
    name: 'Browser',
    status: 'ok',
    message: 'Browser runtime available.',
    durationMs: 0,
  });

  checks.push({
    name: 'Network',
    status: navigator.onLine ? 'ok' : 'warning',
    message: navigator.onLine ? 'Network connection available.' : 'Device is offline.',
    durationMs: 0,
  });

  checks.push({
    name: 'PWA Service Worker',
    status: 'serviceWorker' in navigator ? 'ok' : 'warning',
    message: 'serviceWorker' in navigator
      ? 'Service Worker API available.'
      : 'Service Worker API is unavailable in this browser.',
    durationMs: 0,
  });

  checks.push(await timed('Supabase Reachability', async () => {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: 'GET',
      headers: {
        apikey: SUPABASE_ANON_KEY,
      },
      cache: 'no-store',
    });

    return {
      name: 'Supabase Reachability',
      status: response.ok || response.status === 401 ? 'ok' : 'warning',
      message: `Supabase endpoint responded with HTTP ${response.status}.`,
      durationMs: 0,
    };
  }));

  return checks;
}

export async function runAuthenticatedHealthCheck(
  token: string,
): Promise<HealthCheck> {
  return timed('Authenticated Session', async () => {
    if (!token) {
      return {
        name: 'Authenticated Session',
        status: 'warning',
        message: 'No active session token found.',
        durationMs: 0,
      };
    }

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/`,
      {
        method: 'GET',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      },
    );

    return {
      name: 'Authenticated Session',
      status: response.status === 401 ? 'error' : 'ok',
      message: response.status === 401
        ? 'Session may be expired or invalid.'
        : 'Authenticated network request completed.',
      durationMs: 0,
    };
  });
}
