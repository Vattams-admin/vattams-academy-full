import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  Wifi,
  WifiOff,
} from 'lucide-react';
import {
  classifyNetworkState,
  type NetworkHealthState,
} from '@/lib/academySecurityHardening';

export default function AcademySecurityNetworkStatus() {
  const [state, setState] = useState<NetworkHealthState>(
    typeof navigator !== 'undefined' && navigator.onLine
      ? 'online'
      : 'offline',
  );
  const [lastChecked, setLastChecked] = useState(new Date());

  useEffect(() => {
    const onOnline = () => {
      setState('online');
      setLastChecked(new Date());
    };

    const onOffline = () => {
      setState('offline');
      setLastChecked(new Date());
    };

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  const checkNetwork = async () => {
    const started = performance.now();

    try {
      if (!navigator.onLine) {
        setState('offline');
        setLastChecked(new Date());
        return;
      }

      // Use a lightweight same-origin request when available.
      // No sensitive data is sent.
      const response = await fetch('/favicon.ico', {
        method: 'HEAD',
        cache: 'no-store',
      });

      const latency = performance.now() - started;
      setState(
        response.ok
          ? classifyNetworkState(true, latency)
          : 'unstable',
      );
    } catch {
      setState('unstable');
    }

    setLastChecked(new Date());
  };

  return (
    <section className="space-y-5">
      <div className="bg-white border rounded-3xl p-5">
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-indigo-50 text-indigo-600 p-3">
              <ShieldCheck size={22} />
            </div>
            <div>
              <p className="text-xs font-black uppercase text-indigo-600">
                Production Hardening
              </p>
              <h2 className="text-2xl font-black mt-1">
                Security & Network Health
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Login resilience, safe redirects, network detection and
                authentication protection.
              </p>
            </div>
          </div>

          <StateBadge state={state} />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        <SecurityCard
          icon={<LockKeyhole size={20} />}
          title="Authentication"
          description="Use the existing authenticated backend session. Never trust client-only role checks."
        />
        <SecurityCard
          icon={state === 'offline' ? <WifiOff size={20} /> : <Wifi size={20} />}
          title="Network"
          description="Detect offline/unstable connectivity and allow safe retry instead of treating a transient error as a failed account."
        />
        <SecurityCard
          icon={<CheckCircle2 size={20} />}
          title="Session Safety"
          description="Protect return paths and keep authorization decisions on the server."
        />
      </div>

      <div className="bg-white border rounded-3xl p-5">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <p className="font-black">Network status</p>
            <p className="text-sm text-slate-500 mt-1">
              Last checked: {lastChecked.toLocaleTimeString('en-IN')}
            </p>
          </div>

          <button
            type="button"
            onClick={checkNetwork}
            className="rounded-xl bg-indigo-600 text-white px-5 py-3 font-black inline-flex items-center gap-2"
          >
            <RefreshCw size={16} /> Check Connection
          </button>
        </div>

        <div className="mt-5 rounded-2xl bg-slate-50 p-5">
          {state === 'online' && (
            <p className="font-black text-emerald-700">
              Online — authentication requests can be attempted.
            </p>
          )}
          {state === 'unstable' && (
            <p className="font-black text-amber-700">
              Unstable — retry transient requests safely; do not duplicate
              payment or submission actions.
            </p>
          )}
          {state === 'offline' && (
            <p className="font-black text-red-700">
              Offline — do not mark login/payment/submission as permanently
              failed until connectivity is restored.
            </p>
          )}
          {state === 'checking' && (
            <p className="font-black text-slate-700">Checking connection…</p>
          )}
        </div>
      </div>

      <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5">
        <div className="flex gap-3">
          <CheckCircle2 className="text-emerald-600 shrink-0" />
          <div>
            <p className="font-black text-emerald-950">
              All-network login requirement
            </p>
            <p className="text-sm text-emerald-900 mt-1">
              Login should work over normal mobile data, Wi-Fi and changing
              networks. The application should retry only safe transient
              failures, preserve the user's entered identifier, and never
              duplicate a submitted transaction.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5">
        <p className="font-black text-amber-950">
          Production checklist
        </p>
        <ul className="text-sm text-amber-900 mt-2 space-y-1 list-disc pl-5">
          <li>HTTPS only in production.</li>
          <li>Use the existing Supabase/auth session flow.</li>
          <li>Do not put service-role keys in the browser.</li>
          <li>Keep RLS enabled and test every role.</li>
          <li>Use safe server-side redirects after login.</li>
          <li>Retry only transient network/server failures.</li>
          <li>Use idempotency for payment/submission operations.</li>
          <li>Test login on Wi-Fi, 4G/5G and network switching.</li>
          <li>Do not log passwords, OTPs, tokens or private payment data.</li>
        </ul>
      </div>
    </section>
  );
}

function StateBadge({ state }: { state: NetworkHealthState }) {
  const label = state === 'online'
    ? 'ONLINE'
    : state === 'offline'
      ? 'OFFLINE'
      : state === 'unstable'
        ? 'UNSTABLE'
        : 'CHECKING';

  return (
    <span className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-black">
      {label}
    </span>
  );
}

function SecurityCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white border rounded-2xl p-5">
      <div className="text-indigo-600">{icon}</div>
      <p className="font-black mt-3">{title}</p>
      <p className="text-sm text-slate-500 mt-1">{description}</p>
    </div>
  );
}
