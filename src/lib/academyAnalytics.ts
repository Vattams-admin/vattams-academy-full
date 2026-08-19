export type AcademyMetric = {
  label: string;
  value: number | string;
  description?: string;
};

export type AcademyAnalyticsSnapshot = {
  capturedAt: string;
  online: boolean;
  standalone: boolean;
  environment: string;
  route: string;
  metrics: AcademyMetric[];
};

export function captureAcademyAnalyticsSnapshot(): AcademyAnalyticsSnapshot {
  const env =
    (import.meta as any).env?.VITE_APP_ENV ||
    (import.meta as any).env?.MODE ||
    'unknown';

  return {
    capturedAt: new Date().toISOString(),
    online: navigator.onLine,
    standalone:
      window.matchMedia?.('(display-mode: standalone)').matches ||
      Boolean((navigator as any).standalone),
    environment: String(env),
    route: window.location.hash || '#/home',
    metrics: [
      {
        label: 'Online',
        value: navigator.onLine ? 'Yes' : 'No',
        description: 'Current browser network state.',
      },
      {
        label: 'PWA',
        value:
          window.matchMedia?.('(display-mode: standalone)').matches ||
          Boolean((navigator as any).standalone)
            ? 'Installed'
            : 'Browser',
        description: 'Current application display mode.',
      },
      {
        label: 'Route',
        value: window.location.hash || '#/home',
        description: 'Current Academy route.',
      },
    ],
  };
}

export function measureWebVitalsSnapshot() {
  const navigation = performance.getEntriesByType('navigation')[0] as
    | PerformanceNavigationTiming
    | undefined;

  const paints = performance.getEntriesByType('paint');
  const fcp = paints.find(
    (entry) => entry.name === 'first-contentful-paint',
  );

  return {
    fcpMs: fcp ? Math.round(fcp.startTime) : null,
    domContentLoadedMs: navigation
      ? Math.round(navigation.domContentLoadedEventEnd)
      : null,
    loadMs: navigation ? Math.round(navigation.loadEventEnd) : null,
  };
}
