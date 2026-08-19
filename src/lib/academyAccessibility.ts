export function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

export function focusAcademyElement(selector: string) {
  const element = document.querySelector<HTMLElement>(selector);
  if (!element) return false;

  if (!element.hasAttribute('tabindex')) {
    element.setAttribute('tabindex', '-1');
  }

  element.focus({ preventScroll: false });
  return document.activeElement === element;
}

export function installAcademyAccessibilityHelpers() {
  const root = document.querySelector('#root');
  if (!root) return () => undefined;

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Tab') return;

    document.documentElement.classList.add('academy-keyboard-navigation');
  };

  const onPointerDown = () => {
    document.documentElement.classList.remove('academy-keyboard-navigation');
  };

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('pointerdown', onPointerDown);

  return () => {
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('pointerdown', onPointerDown);
  };
}
