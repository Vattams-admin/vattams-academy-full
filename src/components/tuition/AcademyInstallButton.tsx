import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import {
  captureInstallPrompt,
  isAcademyStandalone,
  promptAcademyInstall,
} from '@/lib/academyPwa';

export default function AcademyInstallButton() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    captureInstallPrompt();

    const update = () => setReady(true);
    window.addEventListener('vattams:pwa-install-ready', update);
    return () => window.removeEventListener('vattams:pwa-install-ready', update);
  }, []);

  if (!ready || isAcademyStandalone()) return null;

  return (
    <button
      type="button"
      onClick={async () => {
        const installed = await promptAcademyInstall();
        if (installed) setReady(false);
      }}
      className="rounded-xl bg-indigo-600 text-white px-4 py-2 font-black inline-flex items-center gap-2"
    >
      <Download size={16} />
      Install Academy
    </button>
  );
}
