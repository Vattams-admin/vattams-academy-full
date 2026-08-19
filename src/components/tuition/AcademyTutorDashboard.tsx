import { useMemo } from 'react';
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  GraduationCap,
  Users,
  Video,
} from 'lucide-react';
import {
  getTutorDashboardSummary,
  getUpcomingTutorSessions,
  type TutorDashboardSession,
  type TutorDashboardSummary,
} from '@/lib/academyTutorDashboard';

const DEMO_SUMMARY: TutorDashboardSummary = {
  assignedStudents: 24,
  activeCourses: 4,
  upcomingClasses: 3,
  pendingAssignments: 6,
  attendanceToReview: 2,
  unreadNotifications: 4,
};

const DEMO_SESSIONS: TutorDashboardSession[] = [
  {
    id: 'tutor-session-1',
    title: 'Mathematics — Fractions',
    startAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    endAt: new Date(Date.now() + 120 * 60 * 1000).toISOString(),
    status: 'scheduled',
    studentsCount: 12,
  },
  {
    id: 'tutor-session-2',
    title: 'Science — Matter',
    startAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    endAt: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
    status: 'scheduled',
    studentsCount: 8,
  },
  {
    id: 'tutor-session-3',
    title: 'English — Communication Skills',
    startAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    endAt: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
    status: 'scheduled',
    studentsCount: 15,
  },
];

export default function AcademyTutorDashboard({
  summary = DEMO_SUMMARY,
  sessions = DEMO_SESSIONS,
}: {
  summary?: TutorDashboardSummary;
  sessions?: TutorDashboardSession[];
}) {
  const dashboard = useMemo(
    () => getTutorDashboardSummary(summary),
    [summary],
  );

  const upcoming = useMemo(
    () => getUpcomingTutorSessions(sessions),
    [sessions],
  );

  return (
    <section className="space-y-5">
      <div className="bg-white border rounded-3xl p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-indigo-50 text-indigo-600 p-3">
              <GraduationCap size={22} />
            </div>
            <div>
              <p className="text-xs font-black uppercase text-indigo-600">
                Tutor Portal
              </p>
              <h2 className="text-2xl font-black mt-1">
                Tutor Dashboard
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Manage students, courses, classes, assignments and attendance from one place.
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-emerald-50 text-emerald-700 px-4 py-2 text-sm font-black inline-flex items-center gap-2">
            <CheckCircle2 size={16} /> Tutor Access
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <Metric icon={<Users size={18} />} label="Students" value={dashboard.assignedStudents} />
        <Metric icon={<BookOpen size={18} />} label="Courses" value={dashboard.activeCourses} />
        <Metric icon={<CalendarDays size={18} />} label="Classes" value={dashboard.upcomingClasses} />
        <Metric icon={<ClipboardCheck size={18} />} label="Assignments" value={dashboard.pendingAssignments} />
        <Metric icon={<CheckCircle2 size={18} />} label="Attendance" value={dashboard.attendanceToReview} />
        <Metric icon={<Video size={18} />} label="Attention" value={dashboard.totalAttentionItems} />
      </div>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-5">
        <div className="bg-white border rounded-3xl p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase text-indigo-600">
                Classroom
              </p>
              <h3 className="text-xl font-black mt-1">
                Upcoming Classes
              </h3>
            </div>
            <a
              href="#/classroom"
              className="rounded-xl border px-3 py-2 text-sm font-black"
            >
              View All
            </a>
          </div>

          <div className="space-y-3 mt-4">
            {upcoming.map((session) => (
              <article
                key={session.id}
                className="rounded-2xl bg-slate-50 p-4"
              >
                <div className="flex flex-wrap justify-between gap-3">
                  <div>
                    <p className="font-black">{session.title}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(session.startAt).toLocaleString('en-IN')}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {session.studentsCount} students
                    </p>
                  </div>
                  <a
                    href="#/classroom"
                    className="self-start rounded-xl bg-indigo-600 text-white px-3 py-2 text-sm font-black inline-flex items-center gap-2"
                  >
                    <Video size={15} /> Classroom
                  </a>
                </div>
              </article>
            ))}

            {upcoming.length === 0 && (
              <div className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">
                No upcoming classes.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-5">
          <QuickAction
            title="My Students"
            description="Review assigned students and learning progress."
            href="#/students"
            icon={<Users size={20} />}
          />
          <QuickAction
            title="Assignments"
            description="Review pending student submissions."
            href="#/assignments"
            icon={<ClipboardCheck size={20} />}
          />
          <QuickAction
            title="Attendance"
            description="Review and manage class attendance."
            href="#/attendance"
            icon={<CalendarDays size={20} />}
          />
          <QuickAction
            title="Courses"
            description="Open your assigned Academy courses."
            href="#/tuition-courses"
            icon={<BookOpen size={20} />}
          />
        </div>
      </div>

      <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-5">
        <p className="font-black text-indigo-950">Tutor workflow</p>
        <p className="text-sm text-indigo-900 mt-1">
          Registration → Payment/UTR → Admin Verification → Approval → Tutor Dashboard →
          Courses → Students → Classroom → Materials → Attendance → Assignments → Tests → Progress.
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5">
        <p className="font-black text-amber-950">Data protection</p>
        <p className="text-sm text-amber-900 mt-1">
          This dashboard is a presentation foundation. Production authorization must
          come from the existing authenticated tutor role and server-side RLS; tutors
          must only access their assigned students, courses and sessions.
        </p>
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

function QuickAction({
  title,
  description,
  href,
  icon,
}: {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="block bg-white border rounded-3xl p-5 hover:border-indigo-300 transition"
    >
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-indigo-50 text-indigo-600 p-3">
          {icon}
        </div>
        <div>
          <h3 className="font-black">{title}</h3>
          <p className="text-sm text-slate-500 mt-1">{description}</p>
        </div>
      </div>
    </a>
  );
}
