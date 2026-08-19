export type LaunchSmokeCheck = {
  name: string;
  status: 'pass' | 'review';
  message: string;
};

export function runPostLaunchSmokeChecks(): LaunchSmokeCheck[] {
  const checks: LaunchSmokeCheck[] = [];

  checks.push({
    name: 'HTTPS',
    status: window.location.protocol === 'https:' || window.location.hostname === 'localhost'
      ? 'pass'
      : 'review',
    message: window.location.protocol === 'https:'
      ? 'Secure HTTPS connection detected.'
      : 'Production should use HTTPS.',
  });

  checks.push({
    name: 'Network',
    status: navigator.onLine ? 'pass' : 'review',
    message: navigator.onLine ? 'Network available.' : 'Device is offline.',
  });

  checks.push({
    name: 'PWA',
    status: 'serviceWorker' in navigator ? 'pass' : 'review',
    message: 'serviceWorker' in navigator
      ? 'Service Worker API available.'
      : 'Service Worker API unavailable.',
  });

  checks.push({
    name: 'Application Root',
    status: document.querySelector('#root') ? 'pass' : 'review',
    message: document.querySelector('#root')
      ? 'Application root is present.'
      : 'Application root was not found.',
  });

  return checks;
}

export function getRuntimeSummary() {
  return {
    hostname: window.location.hostname,
    protocol: window.location.protocol,
    online: navigator.onLine,
    standalone:
      window.matchMedia?.('(display-mode: standalone)').matches ||
      Boolean((navigator as any).standalone),
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
  };
}
