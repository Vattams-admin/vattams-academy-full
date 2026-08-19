let deferredInstallPrompt: any = null;

export function registerAcademyServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/academy-sw.js', { scope: '/' })
      .catch((error) => {
        console.warn('[VATTAMS Academy] Service worker registration failed:', error);
      });
  });
}

export function captureInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (event: Event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    window.dispatchEvent(new CustomEvent('vattams:pwa-install-ready'));
  });

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    window.dispatchEvent(new CustomEvent('vattams:pwa-installed'));
  });
}

export async function promptAcademyInstall() {
  if (!deferredInstallPrompt) return false;

  deferredInstallPrompt.prompt();
  const choice = await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;

  return choice?.outcome === 'accepted';
}

export function canInstallAcademy() {
  return Boolean(deferredInstallPrompt);
}

export function isAcademyStandalone() {
  return window.matchMedia?.('(display-mode: standalone)').matches ||
    Boolean((navigator as any).standalone);
}

export function getNetworkState() {
  return {
    online: navigator.onLine,
    effectiveType: (navigator as any).connection?.effectiveType || null,
    downlink: (navigator as any).connection?.downlink ?? null,
    saveData: Boolean((navigator as any).connection?.saveData),
  };
}

export function subscribeNetworkState(callback: (state: ReturnType<typeof getNetworkState>) => void) {
  const update = () => callback(getNetworkState());

  window.addEventListener('online', update);
  window.addEventListener('offline', update);

  const connection = (navigator as any).connection;
  connection?.addEventListener?.('change', update);

  return () => {
    window.removeEventListener('online', update);
    window.removeEventListener('offline', update);
    connection?.removeEventListener?.('change', update);
  };
}
