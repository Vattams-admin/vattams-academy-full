import { useEffect, useState } from 'react';
import { CheckCircle2, Wifi, WifiOff } from 'lucide-react';
import { getNetworkState, subscribeNetworkState } from '@/lib/academyPwa';

export default function AcademyNetworkStatus() {
  const [state, setState] = useState(getNetworkState());

  useEffect(() => subscribeNetworkState(setState), []);

  if (state.online) return null;

  return (
    <div className="fixed left-3 right-3 bottom-3 z-[100] rounded-2xl border border-amber-200 bg-amber-50 text-amber-900 shadow-lg px-4 py-3">
      <div className="flex items-center gap-3">
        <WifiOff size={18} className="shrink-0" />
        <div>
          <p className="font-black text-sm">You are offline</p>
          <p className="text-xs mt-0.5">
            Your Academy session is kept locally. Please reconnect before submitting
            payments, assignments, tests or other important data.
          </p>
        </div>
      </div>
    </div>
  );
}
