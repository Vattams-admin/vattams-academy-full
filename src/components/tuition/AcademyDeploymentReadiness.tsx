import { useMemo } from 'react';
import {
  CheckCircle2,
  Cloud,
  Globe2,
  LockKeyhole,
  Server,
  ShieldCheck,
  TriangleAlert,
} from 'lucide-react';
import {
  getPublicConfigurationChecklist,
  getPublicEnvironmentReport,
} from '@/lib/academyEnvironment';

export default function AcademyDeploymentReadiness() {
  const environment = useMemo(() => getPublicEnvironmentReport(), []);
  const configuration = useMemo(() => getPublicConfigurationChecklist(), []);

  const checks = [
    {
      title: 'HTTPS / secure context',
      ok: environment.secureContext || environment.hostname === 'localhost',
      detail: environment.secureContext
        ? 'Secure context detected.'
        : 'Production must use HTTPS.',
    },
    {
      title: 'Supabase public URL configuration',
      ok: configuration.supabaseUrlPresent,
      detail: configuration.supabaseUrlPresent
        ? 'Public Supabase URL is configured.'
        : 'Configure the public Supabase URL before production.',
    },
    {
      title: 'Public client key configuration',
      ok: configuration.publicAnonKeyPresent,
      detail: configuration.publicAnonKeyPresent
        ? 'A public client key is configured.'
        : 'Configure the public client key before production.',
    },
    {
      title: 'Service Worker support',
      ok: environment.serviceWorkerSupported,
      detail: environment.serviceWorkerSupported
        ? 'Browser supports Service Workers.'
        : 'This browser does not support Service Workers.',
    },
    {
      title: 'Network',
      ok: environment.online,
      detail: environment.online ? 'Network is available.' : 'Device is offline.',
    },
  ];

  const passCount = checks.filter((check) => check.ok).length;

  return (
    <section className="space-y-5">
      <div className="bg-white border rounded-3xl p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase text-indigo-600">
              Production Readiness
            </p>
            <h2 className="text-2xl font-black mt-1">
              Deployment Environment
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Public configuration and browser-environment checks only.
            </p>
          </div>
          <Cloud className="text-indigo-600" />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Info title="Environment" value={environment.environment} icon={<Server size={17} />} />
        <Info title="Host" value={environment.hostname || '—'} icon={<Globe2 size={17} />} />
        <Info title="Protocol" value={environment.protocol || '—'} icon={<LockKeyhole size={17} />} />
        <Info title="Checks" value={`${passCount}/${checks.length}`} icon={<ShieldCheck size={17} />} />
      </div>

      <div className="bg-white border rounded-3xl p-5">
        <h3 className="font-black">Environment Checks</h3>
        <div className="space-y-3 mt-4">
          {checks.map((check) => (
            <div
              key={check.title}
              className="rounded-2xl border p-4 flex items-start gap-3"
            >
              {check.ok ? (
                <CheckCircle2 className="text-emerald-600 shrink-0" size={20} />
              ) : (
                <TriangleAlert className="text-amber-600 shrink-0" size={20} />
              )}
              <div>
                <p className="font-black text-sm">{check.title}</p>
                <p className="text-xs text-slate-500 mt-1">{check.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-rose-50 border border-rose-200 rounded-3xl p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck className="text-rose-600 shrink-0" />
          <div>
            <p className="font-black text-rose-950">
              Secret-key safety rule
            </p>
            <p className="text-sm text-rose-900 mt-1">
              Never put Supabase service-role keys, private API keys, passwords,
              payment secrets or other server credentials in VITE_* variables or
              browser code. Only public client configuration belongs in the frontend.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-5">
        <p className="font-black text-indigo-950">Deployment gate</p>
        <p className="text-sm text-indigo-900 mt-1">
          This component does not deploy anything. Production deployment must be
          performed only after the final Supabase, Edge Function, build, backup,
          security and real-device checks pass.
        </p>
      </div>
    </section>
  );
}

function Info({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white border rounded-2xl p-4">
      <div className="flex items-center gap-2 text-slate-500">
        {icon}
        <span className="text-xs font-black uppercase">{title}</span>
      </div>
      <p className="font-black mt-2 break-words">{value}</p>
    </div>
  );
}
