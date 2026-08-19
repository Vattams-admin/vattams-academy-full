export type PerformanceSnapshot = {
  navigationMs: number | null;
  domContentLoadedMs: number | null;
  loadMs: number | null;
  firstContentfulPaintMs: number | null;
  connection: string | null;
  online: boolean;
};

export function getPerformanceSnapshot(): PerformanceSnapshot {
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
  const paints = performance.getEntriesByType('paint');

  const fcp = paints.find((entry) => entry.name === 'first-contentful-paint');

  const connection = (navigator as any).connection;

  return {
    navigationMs: navigation ? Math.round(navigation.duration) : null,
    domContentLoadedMs: navigation
      ? Math.round(navigation.domContentLoadedEventEnd)
      : null,
    loadMs: navigation ? Math.round(navigation.loadEventEnd) : null,
    firstContentfulPaintMs: fcp ? Math.round(fcp.startTime) : null,
    connection: connection?.effectiveType || null,
    online: navigator.onLine,
  };
}

export function getAccessibilityChecks() {
  const root = document.querySelector('#root');

  const images = Array.from(document.images);
  const buttons = Array.from(document.querySelectorAll('button'));
  const links = Array.from(document.querySelectorAll('a'));
  const inputs = Array.from(document.querySelectorAll('input, select, textarea'));

  const missingAlt = images.filter((image) => !image.hasAttribute('alt')).length;
  const unnamedButtons = buttons.filter((button) => {
    const text = button.textContent?.trim();
    return !text && !button.getAttribute('aria-label') && !button.getAttribute('title');
  }).length;

  const unnamedLinks = links.filter((link) => {
    const text = link.textContent?.trim();
    return !text && !link.getAttribute('aria-label');
  }).length;

  const unlabeledInputs = inputs.filter((input) => {
    const id = input.getAttribute('id');
    const aria = input.getAttribute('aria-label');
    const labelledBy = input.getAttribute('aria-labelledby');

    if (aria || labelledBy) return false;
    if (!id) return true;

    return !document.querySelector(`label[for="${CSS.escape(id)}"]`);
  }).length;

  return {
    rootExists: Boolean(root),
    missingAlt,
    unnamedButtons,
    unnamedLinks,
    unlabeledInputs,
    languageDeclared: Boolean(document.documentElement.getAttribute('lang')),
  };
}
