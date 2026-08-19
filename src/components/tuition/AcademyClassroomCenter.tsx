import { useMemo, useState } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  ExternalLink,
  GraduationCap,
  MonitorPlay,
  ShieldCheck,
  Video,
} from 'lucide-react';
import {
  canJoinClassroom,
  getClassroomSessionStatus,
  sortClassroomSessions,
  type ClassroomSession,
} from '@/lib/academyClassroom';

const DEMO_SESSIONS: ClassroomSession[] = [
  {
    id: 'class-demo-1',
    courseId: 'mathematics',
    tutorId: 'tutor-demo',
    title: 'Mathematics — Fractions',
    startAt: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
    endAt: new Date(Date.now() + 105 * 60 * 1000).toISOString(),
    meetingUrl: '#/classroom/live',
    status: 'scheduled',
  },
  {
    id: 'class-demo-2',
    courseId: 'science',
    tutorId: 'tutor-demo',
    title: 'Science — Introduction',
    startAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    endAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    meetingUrl: '#/classroom/live',
    status: 'completed',
  },
];

export default function AcademyClassroomCenter({
  initialSessions = DEMO_SESSIONS,
}: {
  initialSessions?: ClassroomSession[];
}) {
  const [sessions] = useState(initialSessions);
  const sorted = useMemo(() => sortClassroomSessions(sessions), [sessions]);
  const now = Date.now();

  return (
    <section className="space-y-5">
      <div className="bg-white border rounded-3xl p-5">
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-indigo-50 text-indigo-600 p-3">
              <MonitorPlay size={22} />
            </div>
            <div>
              <p className="text-xs font-black uppercase text-indigo-600">
                Classroom
              </p>
              <h2 className="text-2xl font-black mt-1">
                VATTAMS Academy Virtual Classroom
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                One place for scheduled online classes, live sessions and class history.
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-emerald-50 text-emerald-700 px-4 py-2 text-sm font-black inline-flex items-center gap-2">
            <Video size={16} /> Online Learning
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        <Stat
          label="Upcoming"
          value={sorted.filter((s) => getClassroomSessionStatus(s, now) === 'scheduled').length}
        />
        <Stat
          label="Live"
          value={sorted.filter((s) => getClassroomSessionStatus(s, now) === 'live').length}
        />
        <Stat
          label="Completed"
          value={sorted.filter((s) => getClassroomSessionStatus(s, now) === 'completed').length}
        />
      </div>

      <div className="space-y-3">
        {sorted.map((session) => {
          const status = getClassroomSessionStatus(session, now);
          const joinable = canJoinClassroom(session, now);

          return (
            <article key={session.id} className="bg-white border rounded-3xl p-5">
              <div className="flex flex-wrap justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <GraduationCap size={20} className="text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-black">{session.title}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Course: {session.courseId} · Tutor: {session.tutorId}
                    </p>
                  </div>
                </div>

                <StatusBadge status={status} />
              </div>

              <div className="grid md:grid-cols-2 gap-3 mt-4">
                <Info
                  icon={<CalendarDays size={16} />}
                  label="Starts"
                  value={new Date(session.startAt).toLocaleString('en-IN')}
                />
                <Info
                  icon={<Clock3 size={16} />}
                  label="Ends"
                  value={new Date(session.endAt).toLocaleString('en-IN')}
                />
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {joinable ? (
                  <a
                    href={session.meetingUrl}
                    className="rounded-xl bg-indigo-600 text-white px-4 py-3 font-black inline-flex items-center gap-2"
                  >
                    <Video size={16} /> Join Live Class
                  </a>
                ) : (
                  <span className="rounded-xl bg-slate-100 text-slate-500 px-4 py-3 text-sm font-black">
                    {status === 'scheduled'
                      ? 'Join button appears when class is live'
                      : 'Classroom session closed'}
                  </span>
                )}

                {session.meetingUrl && (
                  <a
                    href={session.meetingUrl}
                    className="rounded-xl border px-4 py-3 font-black inline-flex items-center gap-2"
                  >
                    <ExternalLink size={16} /> Open Classroom
                  </a>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-5">
        <div className="flex gap-3">
          <ShieldCheck className="text-indigo-600 shrink-0" />
          <div>
            <p className="font-black text-indigo-950">
              Classroom security
            </p>
            <p className="text-sm text-indigo-900 mt-1">
              Production meeting links must be protected by authenticated,
              role-aware access. Do not expose private meeting URLs publicly.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5">
        <div className="flex gap-3">
          <CheckCircle2 className="text-emerald-600 shrink-0" />
          <div>
            <p className="font-black text-emerald-950">
              Existing Tuition functionality preserved
            </p>
            <p className="text-sm text-emerald-900 mt-1">
              This phase provides the classroom UI/state foundation without
              replacing existing booking, tutor approval or historical tuition data.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white border rounded-2xl p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-2xl font-black mt-1">{value}</p>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
}) {
  const text = {
    scheduled: 'Scheduled',
    live: 'Live Now',
    completed: 'Completed',
    cancelled: 'Cancelled',
  }[status];

  const classes = {
    scheduled: 'bg-indigo-50 text-indigo-700',
    live: 'bg-emerald-50 text-emerald-700',
    completed: 'bg-slate-100 text-slate-600',
    cancelled: 'bg-rose-50 text-rose-700',
  }[status];

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-black ${classes}`}>
      {text}
    </span>
  );
}

function Info({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3 flex items-start gap-2">
      <span className="text-slate-500">{icon}</span>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm font-black mt-1">{value}</p>
      </div>
    </div>
  );
}
