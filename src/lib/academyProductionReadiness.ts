export type CheckStatus = 'pass' | 'warning' | 'fail';

export type ProductionCheck = {
  id: string;
  category: 'authentication' | 'security' | 'data' | 'payments' | 'ui' | 'deployment';
  title: string;
  status: CheckStatus;
  detail: string;
};

export const REQUIRED_PRODUCTION_CHECKS: ProductionCheck[] = [
  {
    id: 'auth-all-network',
    category: 'authentication',
    title: 'Login over Wi-Fi and mobile data',
    status: 'warning',
    detail: 'Must be verified on real devices before release.',
  },
  {
    id: 'auth-session',
    category: 'authentication',
    title: 'Session persistence after network switching',
    status: 'warning',
    detail: 'Verify authenticated sessions survive normal network changes.',
  },
  {
    id: 'rls',
    category: 'security',
    title: 'RLS and role authorization',
    status: 'warning',
    detail: 'Run role-by-role authorization tests against production-like data.',
  },
  {
    id: 'secrets',
    category: 'security',
    title: 'No service secrets in frontend',
    status: 'pass',
    detail: 'Frontend implementation must never contain service-role credentials.',
  },
  {
    id: 'historical-data',
    category: 'data',
    title: 'Historical Tuition data preserved',
    status: 'pass',
    detail: 'Release process must not delete or recreate existing records.',
  },
  {
    id: 'payment-idempotency',
    category: 'payments',
    title: 'Payment/submission duplicate protection',
    status: 'warning',
    detail: 'Verify server-side idempotency before production financial writes.',
  },
  {
    id: 'responsive',
    category: 'ui',
    title: 'Mobile and desktop responsive checks',
    status: 'warning',
    detail: 'Verify primary screens on supported browsers and devices.',
  },
  {
    id: 'https',
    category: 'deployment',
    title: 'HTTPS and production environment',
    status: 'warning',
    detail: 'Verify production domain, HTTPS, environment variables and build.',
  },
];

export function getProductionReadiness(checks = REQUIRED_PRODUCTION_CHECKS) {
  const failures = checks.filter((check) => check.status === 'fail').length;
  const warnings = checks.filter((check) => check.status === 'warning').length;
  const passes = checks.filter((check) => check.status === 'pass').length;

  return {
    ready: failures === 0 && warnings === 0,
    failures,
    warnings,
    passes,
    total: checks.length,
  };
}

export function canReleaseToProduction(
  checks = REQUIRED_PRODUCTION_CHECKS,
) {
  return checks.every((check) => check.status === 'pass');
}
