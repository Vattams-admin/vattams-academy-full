import { useEffect, useState } from 'react';
import {
  Accessibility,
  CheckCircle2,
  Eye,
  Keyboard,
  Minus,
  Plus,
  RotateCcw,
  Volume2,
} from 'lucide-react';
import {
  installAcademyAccessibilityHelpers,
  prefersReducedMotion,
} from '@/lib/academyAccessibility';

const FONT_SCALE_KEY = 'vattams_academy_font_scale';

export default function AcademyAccessibilityTools() {
  const [fontScale, setFontScale] = useState(() => {
    const stored = Number(localStorage.getItem(FONT_SCALE_KEY));
    return Number.isFinite(stored) && stored >= 90 && stored <= 120 ? stored : 100;
  });
  const [reducedMotion, setReducedMotion] = useState(prefersReducedMotion());

  useEffect(() => {
    const cleanup = installAcademyAccessibilityHelpers();
    return cleanup;
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--academy-font-scale',
      `${fontScale}%`,
    );
    localStorage.setItem(FONT_SCALE_KEY, String(fontScale));
  }, [fontScale]);

  const changeScale = (delta: number) => {
    setFontScale((current) =>
      Math.min(120, Math.max(90, current + delta)),
    );
  };

  const reset = () => {
    setFontScale(100);
    setReducedMotion(prefersReducedMotion());
  };

  return (
    <section className="bg-white border rounded-3xl p-5">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-indigo-50 text-indigo-600 p-3">
          <Accessibility size={22} />
        </div>
        <div>
          <p className="text-xs font-black uppercase text-indigo-600">
            Accessibility
          </p>
          <h2 className="text-xl font-black mt-1">Academy Accessibility Tools</h2>
          <p className="text-sm text-slate-500 mt-1">
            Simple display and motion preferences for a more comfortable learning experience.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-3 mt-5">
        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="flex items-center gap-2">
            <Eye size={18} className="text-indigo-600" />
            <p className="font-black text-sm">Text size</p>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Current: {fontScale}%
          </p>

          <div className="flex items-center gap-2 mt-4">
            <button
              type="button"
              onClick={() => changeScale(-5)}
              disabled={fontScale <= 90}
              className="rounded-xl border bg-white p-3 disabled:opacity-40"
              aria-label="Decrease text size"
              title="Decrease text size"
            >
              <Minus size={17} />
            </button>
            <button
              type="button"
              onClick={() => changeScale(5)}
              disabled={fontScale >= 120}
              className="rounded-xl border bg-white p-3 disabled:opacity-40"
              aria-label="Increase text size"
              title="Increase text size"
            >
              <Plus size={17} />
            </button>
          </div>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="flex items-center gap-2">
            <Keyboard size={18} className="text-indigo-600" />
            <p className="font-black text-sm">Keyboard navigation</p>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tab navigation is supported by the application controls.
          </p>
          <div className="mt-3 inline-flex items-center gap-2 text-emerald-700 font-bold text-xs">
            <CheckCircle2 size={15} /> Focus visibility enabled
          </div>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="flex items-center gap-2">
            <Volume2 size={18} className="text-indigo-600" />
            <p className="font-black text-sm">Motion preference</p>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            System preference: {reducedMotion ? 'Reduced motion' : 'Standard motion'}
          </p>
          <div className="mt-3 text-xs text-slate-600">
            The app respects the browser's reduced-motion preference.
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={reset}
        className="mt-5 rounded-xl border px-4 py-2 font-black inline-flex items-center gap-2"
      >
        <RotateCcw size={16} /> Reset display preferences
      </button>
    </section>
  );
}
