type ErrorContext = {
  source?: string;
  route?: string;
  component?: string;
};

const MAX_MESSAGE_LENGTH = 500;

function safeMessage(value: unknown) {
  const message = value instanceof Error ? value.message : String(value ?? 'Unknown error');
  return message.slice(0, MAX_MESSAGE_LENGTH);
}

export function reportAcademyError(error: unknown, context: ErrorContext = {}) {
  const payload = {
    message: safeMessage(error),
    source: context.source || 'unknown',
    route: context.route || window.location.hash || '/',
    component: context.component || 'unknown',
    timestamp: new Date().toISOString(),
  };

  // Phase 40 deliberately keeps reporting local until an approved
  // production telemetry endpoint is configured.
  console.error('[VATTAMS Academy]', payload);

  window.dispatchEvent(
    new CustomEvent('vattams:academy-error', {
      detail: payload,
    }),
  );
}

export function installGlobalAcademyErrorHandlers() {
  window.addEventListener('error', (event) => {
    reportAcademyError(event.error || event.message, {
      source: 'window.error',
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    reportAcademyError(event.reason, {
      source: 'unhandledrejection',
    });
  });
}
