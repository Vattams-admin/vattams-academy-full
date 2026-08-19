import { useMemo } from 'react';
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  CreditCard,
  GraduationCap,
  IndianRupee,
  ShieldCheck,
  Users,
  WalletCards,
} from 'lucide-react';
import {
  buildAdminReportRows,
  getAdminAttentionCount,
  type AdminMetricSnapshot,
} from '@/lib/academyAdminReports';

const DEMO_METRICS: AdminMetricSnapshot = {
  students: 128,
  activeStudents: 104,
  tutors: 22,
  pendingTutorApprovals: 3,
  activeCourses: 14,
  upcomingClasses: 11,
  pendingPayments: 7,
  pendingGrading: 9,
  attendanceReviews: 4,
  pendingSettlements: 2,
};

export default function AcademyAdminMasterDashboard({
  metrics = DEMO_METRICS,
}: {
  metrics?: AdminMetricSnapshot;
}) {
  const rows = useMemo(() => buildAdminReportRows(metrics), [metrics]);
  const attention = getAdminAttentionCount(metrics);

  return (
    <section className="space-y-5">
      <div className="bg-white border rounded-3xl p-5">
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-indigo-50 text-indigo-600 p-3">
              <BarChart3 size={22} />
            </div>
            <div>
              <p className="text-xs font-black uppercase text-indigo-600">
                VATTAMS Academy
              </p>
              <h2 className="text-2xl font-black mt-1">
                Admin Master Dashboard
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Central operational view for students, tutors, courses, classes,
                payments, grading, attendance and settlements.
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-amber-50 text-amber-700 px-4 py-2 text-sm font-black">
            {attention} attention items
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <Metric icon={<Users size={18} />} label="Students" value={metrics.students} />
        <Metric icon={<GraduationCap size={18} />} label="Tutors" value={metrics.tutors} />
        <Metric icon={<BookOpen size={18} />} label="Courses" value={metrics.activeCourses} />
        <Metric icon={<CalendarDays size={18} />} label="Classes" value={metrics.upcomingClasses} />
        <Metric icon={<CreditCard size={18} />} label="Payments" value={metrics.pendingPayments} />
        <Metric icon={<WalletCards size={18} />} label="Settlements" value={metrics.pendingSettlements} />
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-3">
        <Action href="#/admin/tutor-approvals" icon={<GraduationCap size={19} />} title="Tutor Approvals" value={metrics.pendingTutorApprovals} />
        <Action href="#/admin/payments" icon={<CreditCard size={19} />} title="Payment Verification" value={metrics.pendingPayments} />
        <Action href="#/admin/grading" icon={<ClipboardCheck size={19} />} title="Grading Review" value={metrics.pendingGrading} />
        <Action href="#/admin/attendance" icon={<CalendarDays size={19} />} title="Attendance Review" value={metrics.attendanceReviews} />
      </div>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-5">
        <div className="bg-white border rounded-3xl p-5">
          <div className="flex items-center gap-2">
            <BarChart3 size={19} className="text-indigo-600" />
            <h3 className="font-black">Operational Report</h3>
          </div>

          <div className="space-y-2 mt-4">
            {rows.map((row) => (
              <div
                key={row.label}
                className="rounded-2xl bg-slate-50 px-4 py-3 flex justify-between gap-3"
              >
                <span className="text-sm font-bold text-slate-600">
                  {row.label}
                </span>
                <span className="font-black">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <AdminCard
            href="#/admin/students"
            icon={<Users size={20} />}
            title="Student Management"
            description="Review students, enrollments and progress."
          />
          <AdminCard
            href="#/admin/tutors"
            icon={<GraduationCap size={20} />}
            title="Tutor Management"
            description="Review tutor status, assignments and approvals."
          />
          <AdminCard
            href="#/admin/courses"
            icon={<BookOpen size={20} />}
            title="Course Management"
            description="Manage approved catalogue content."
          />
          <AdminCard
            href="#/admin/settlements"
            icon={<IndianRupee size={20} />}
            title="Tutor Settlements"
            description="Review hourly teaching settlements."
          />
        </div>
      </div>

      <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5">
        <div className="flex gap-3">
          <CheckCircle2 className="text-emerald-600 shrink-0" />
          <div>
            <p className="font-black text-emerald-950">
              Admin reporting foundation
            </p>
            <p className="text-sm text-emerald-900 mt-1">
              Dashboard metrics are designed to consume server-authorized data.
              Production reports should be generated from verified database
              records rather than client-calculated values.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5">
        <div className="flex gap-3">
          <ShieldCheck className="text-amber-600 shrink-0" />
          <div>
            <p className="font-black text-amber-950">
              Admin security
            </p>
            <p className="text-sm text-amber-900 mt-1">
              Admin-only routes and reports must be protected by the existing
              authenticated admin role and server-side RLS. Never rely only on
              hiding dashboard links in the client.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="bg-white border rounded-2xl p-4">
      <div className="flex items-center gap-2 text-indigo-600">
        {icon}
        <span className="text-xs font-black text-slate-500">{label}</span>
      </div>
      <p className="text-2xl font-black mt-2">{value}</p>
    </div>
  );
}

function Action({
  href,
  icon,
  title,
  value,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  value: number;
}) {
  return (
    <a href={href} className="bg-white border rounded-2xl p-4 block">
      <div className="flex justify-between items-center gap-3">
        <span className="text-indigo-600">{icon}</span>
        <span className="rounded-full bg-amber-50 text-amber-700 px-2 py-1 text-xs font-black">
          {value}
        </span>
      </div>
      <p className="font-black mt-3">{title}</p>
    </a>
  );
}

function AdminCard({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <a href={href} className="bg-white border rounded-3xl p-5 block">
      <div className="flex gap-3">
        <div className="rounded-2xl bg-indigo-50 text-indigo-600 p-3">
          {icon}
        </div>
        <div>
          <p className="font-black">{title}</p>
          <p className="text-sm text-slate-500 mt-1">{description}</p>
        </div>
      </div>
    </a>
  );
}
