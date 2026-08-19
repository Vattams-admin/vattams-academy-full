export type AcademyEnvironment = 'development' | 'staging' | 'production' | 'unknown';

function envValue(name: string) {
  return (import.meta as any).env?.[name] || '';
}

export function getAcademyEnvironment(): AcademyEnvironment {
  const value = String(
    envValue('VITE_APP_ENV') ||
    envValue('VITE_ENVIRONMENT') ||
    (import.meta as any).env?.MODE ||
    ''
  ).toLowerCase();

  if (value === 'production' || value === 'prod') return 'production';
  if (value === 'staging' || value === 'stage') return 'staging';
  if (value === 'development' || value === 'dev') return 'development';
  return 'unknown';
}

export function isProductionEnvironment() {
  return getAcademyEnvironment() === 'production';
}

export function getPublicEnvironmentReport() {
  return {
    environment: getAcademyEnvironment(),
    hostname: window.location.hostname,
    protocol: window.location.protocol,
    secureContext: window.isSecureContext,
    online: navigator.onLine,
    serviceWorkerSupported: 'serviceWorker' in navigator,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Only public, non-secret configuration is exposed here.
 * Never put Supabase service-role keys, private API keys or passwords
 * in VITE_* variables.
 */
export function getPublicConfigurationChecklist() {
  return {
    supabaseUrlPresent: Boolean(envValue('VITE_SUPABASE_URL')),
    publicAnonKeyPresent: Boolean(
      envValue('VITE_SUPABASE_ANON_KEY') ||
      envValue('VITE_SUPABASE_PUBLISHABLE_KEY')
    ),
    appEnvironmentPresent: Boolean(
      envValue('VITE_APP_ENV') || envValue('VITE_ENVIRONMENT')
    ),
  };
}
