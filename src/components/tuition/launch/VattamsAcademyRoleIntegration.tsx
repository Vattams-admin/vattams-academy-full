import TuitionNotificationCenter from '@/components/tuition/TuitionNotificationCenter';

type Props = {
  role: 'student' | 'tutor' | 'admin';
  children?: React.ReactNode;
};

/**
 * Shared Academy role shell.
 *
 * This is intentionally a reusable wrapper rather than a forced rewrite of
 * the existing dashboards. Existing dashboard logic, auth and routes remain
 * the source of truth.
 */
export default function VattamsAcademyRoleIntegration({
  role,
  children,
}: Props) {
  return (
    <div className="min-h-full">
      <div className="flex items-center justify-between gap-3 mb-5">
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-indigo-600">
            VATTAMS Academy
          </p>
          <p className="text-sm font-bold text-slate-600 capitalize">
            {role} workspace
          </p>
        </div>
        <TuitionNotificationCenter />
      </div>

      {children}
    </div>
  );
}
