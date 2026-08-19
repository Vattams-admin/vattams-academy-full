export const ACADEMY_RELEASE = {
  product: 'VATTAMS Academy',
  tagline: 'Learn. Practice. Achieve.',
  version: '1.0.0-rc.40',
  phase: 40,
  targetLaunchDate: '2026-09-05',
  developmentCompleteDate: '2026-09-02',
  testingStartDate: '2026-09-03',
  testingEndDate: '2026-09-04',
} as const;

export function getReleaseInfo() {
  return {
    ...ACADEMY_RELEASE,
    environment:
      (import.meta as any).env?.MODE ||
      (import.meta as any).env?.VITE_APP_ENV ||
      'unknown',
    buildTime: new Date().toISOString(),
  };
}

export function getLaunchDaysRemaining() {
  const launch = new Date(`${ACADEMY_RELEASE.targetLaunchDate}T00:00:00`);
  const now = new Date();
  const difference = launch.getTime() - now.getTime();
  return Math.ceil(difference / 86400000);
}

export function isReleaseCandidate() {
  return ACADEMY_RELEASE.version.includes('rc.');
}
