export type NetworkHealthState =
  | 'checking'
  | 'online'
  | 'offline'
  | 'unstable';

export type LoginValidationResult = {
  valid: boolean;
  message?: string;
};

export function validateLoginIdentifier(value: string): LoginValidationResult {
  const identifier = value.trim();

  if (!identifier) {
    return { valid: false, message: 'Enter your email or login identifier.' };
  }

  if (identifier.length > 160) {
    return { valid: false, message: 'Login identifier is too long.' };
  }

  return { valid: true };
}

export function validatePassword(value: string): LoginValidationResult {
  if (!value) {
    return { valid: false, message: 'Enter your password.' };
  }

  if (value.length > 256) {
    return { valid: false, message: 'Password is too long.' };
  }

  return { valid: true };
}

export function getSafeReturnPath(pathname: string | null | undefined) {
  if (!pathname || !pathname.startsWith('/')) return '/';
  if (pathname.startsWith('//')) return '/';
  return pathname;
}

export function classifyNetworkState(
  online: boolean,
  latencyMs?: number,
): NetworkHealthState {
  if (!online) return 'offline';
  if (latencyMs === undefined) return 'online';
  if (latencyMs >= 1500) return 'unstable';
  return 'online';
}

export function shouldRetryRequest(
  status: number | undefined,
  attempt: number,
  maxAttempts = 3,
) {
  if (attempt >= maxAttempts) return false;
  if (status === undefined) return true;
  return status === 408 || status === 425 || status === 429 || status >= 500;
}

export function exponentialBackoffMs(
  attempt: number,
  baseMs = 500,
  maxMs = 5000,
) {
  return Math.min(maxMs, baseMs * 2 ** Math.max(0, attempt - 1));
}
