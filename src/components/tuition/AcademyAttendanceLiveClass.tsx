import { useMemo, useState } from 'react';
import {
  CalendarCheck,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Radio,
  ShieldCheck,
  UserCheck,
  Video,
} from 'lucide-react';
import {
  calculateAttendancePercentage,
  canJoinLiveClass,
  markAttendance,
  type AcademyAttendanceRecord,
  type AcademyLiveClass,
} from '@/lib/academyAttendanceLiveClass';

const now = Date.now();

const DEMO_CLASS: AcademyLiveClass = {
  id: 'class-1',
  courseId: 'mathematics',
  tutorId: 'tutor-demo',
  title: 'Mathematics — Fractions',
  startAt: new Date(now + 10 * 60 * 1000).toISOString(),
  endAt: new Date(now + 70 * 60 * 1000).toISOString(),
  meetingUrl: '#/classroom/live',
  status: 'scheduled',
  active: true,
};

const DEMO_ATTENDANCE: AcademyAttendanceRecord[] = [
  {
    id: 'attendance-1',
    classId: 'class-previous-1',
    studentId: 'student-demo',
    tutorId: 'tutor-demo',
    sessionDate: '2026-08-12',
    status: 'present',
    minutesAttended: 58,
    markedAt: '2026-08-12T17:00:00.000Z',
    markedBy: 'tutor-demo',
  },
  {
    id: 'attendance-2',
    classId: 'class-previous-2',
    studentId: 'student-demo',
    tutorId: 'tutor-demo',
    sessionDate: '2026-08-14',
    status: 'late',
    minutesAttended: 42,
    markedAt: '2026-08-14T17:05:00.000Z',
    markedBy: 'tutor-demo',
  },
  {
    id: 'attendance-3',
    classId: 'class-previous-3',
    studentId: 'student-demo',
    tutorId: 'tutor-demo',
    sessionDate: '2026-08-16',
    status: 'absent',
    markedAt: '2026-08-16T18:00:00.000Z',
    markedBy: 'tutor-demo',
  },
];

export default function AcademyAttendanceLiveClass({
  liveClass = DEMO_CLASS,
  initialAttendance = DEMO_ATTENDANCE,
}: {
  liveClass?: AcademyLiveClass;
  initialAttendance?: AcademyAttendanceRecord[];
}) {
  const [attendance, setAttendance] =
    useState(initialAttendance);
  const [message, setMessage] = useState('');

  const percentage = useMemo(
    () => calculateAttendancePercentage(attendance),
    [attendance],
  );

  const joinAllowed = canJoinLiveClass(liveClass);

  const selfMarkPresent = () => {
    const record: AcademyAttendanceRecord = {
      id: `attendance-live-${Date.now()}`,
      classId: liveClass.id,
      studentId: 'student-demo',
      tutorId: liveClass.tutorId,
      sessionDate: new Date().toISOString().slice(0, 10),
      status: 'pending',
    };

    const updated = markAttendance(
      record,
      'present',
      'student-demo',
    );

    setAttendance((current) => [...current, updated]);
    setMessage(
      'Attendance event recorded for this interface. Production attendance must be server-validated.',
    );
  };

  return (
    <section className="space-y-5">
      <div className="bg-white border rounded-3xl p-5">
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-indigo-50 text-indigo-600 p-3">
              <Video size={22} />
            </div>
            <div>
              <p className="text-xs font-black uppercase text-indigo-600">
                VATTAMS Academy
              </p>
              <h2 className="text-2xl font-black mt-1">
                Attendance & Live Class
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Join scheduled classes and track verified attendance.
              </p>
            </div>
          </div>

          <span className="rounded-xl bg-emerald-50 text-emerald-700 px-4 py-2 text-sm font-black">
            {percentage}% attendance
          </span>
        </div>
      </div>

      <div className="bg-white border rounded-3xl p-5">
        <div className="flex flex-wrap justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase text-indigo-600">
              Upcoming Live Class
            </p>
            <h3 className="text-2xl font-black mt-1">
              {liveClass.title}
            </h3>

            <div className="flex flex-wrap gap-2 mt-4">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black inline-flex items-center gap-1">
                <CalendarCheck size={13} />
                {new Date(liveClass.startAt).toLocaleString('en-IN')}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black inline-flex items-center gap-1">
                <Clock3 size={13} />
                {Math.max(
                  0,
                  Math.round(
                    (new Date(liveClass.endAt).getTime() -
                      new Date(liveClass.startAt).getTime()) /
                      60000,
                  ),
                )}{' '}
                min
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {joinAllowed && liveClass.meetingUrl ? (
              <a
                href={liveClass.meetingUrl}
                className="rounded-xl bg-indigo-600 text-white px-5 py-3 font-black inline-flex items-center gap-2"
              >
                <Radio size={16} /> Join Live Class
              </a>
            ) : (
              <span className="rounded-xl bg-slate-100 text-slate-500 px-5 py-3 font-black">
                Join opens 15 min before class
              </span>
            )}

            <button
              type="button"
              onClick={selfMarkPresent}
              className="rounded-xl border px-5 py-3 font-black inline-flex items-center gap-2"
            >
              <UserCheck size={16} /> Check In
            </button>
          </div>
        </div>

        {message && (
          <p className="mt-4 rounded-2xl bg-indigo-50 p-4 text-sm font-bold text-indigo-900">
            {message}
          </p>
        )}
      </div>

      <div className="bg-white border rounded-3xl p-5">
        <div className="flex items-center gap-2">
          <CalendarCheck size={19} className="text-indigo-600" />
          <h3 className="font-black">Attendance History</h3>
        </div>

        <div className="space-y-2 mt-4">
          {attendance.map((record) => (
            <div
              key={record.id}
              className="rounded-2xl bg-slate-50 p-4 flex flex-wrap justify-between gap-3"
            >
              <div>
                <p className="font-black">{record.sessionDate}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {record.minutesAttended !== undefined
                    ? `${record.minutesAttended} minutes attended`
                    : 'Attendance duration pending'}
                </p>
              </div>

              <span
                className={`self-start rounded-full px-3 py-1 text-xs font-black ${
                  record.status === 'present' || record.status === 'late'
                    ? 'bg-emerald-50 text-emerald-700'
                    : record.status === 'absent'
                      ? 'bg-red-50 text-red-700'
                      : 'bg-amber-50 text-amber-700'
                }`}
              >
                {record.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <InfoCard
          icon={<ExternalLink size={19} />}
          title="Live classroom"
          description="The meeting URL should be generated and authorized by the production classroom service."
        />
        <InfoCard
          icon={<ShieldCheck size={19} />}
          title="Attendance security"
          description="Attendance cannot be trusted from a browser button alone. Server-side session validation is required."
        />
      </div>

      <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5">
        <div className="flex gap-3">
          <CheckCircle2 className="text-emerald-600 shrink-0" />
          <div>
            <p className="font-black text-emerald-950">
              Attendance calculation
            </p>
            <p className="text-sm text-emerald-900 mt-1">
              Present and late sessions count as attended. Pending sessions are
              excluded until they are resolved. Production attendance should
              use verified class/session events.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5">
        <p className="font-black text-amber-950">
          Existing system protection
        </p>
        <p className="text-sm text-amber-900 mt-1">
          This phase adds attendance/live-class foundations without replacing
          existing Tuition students, tutors, historical selections,
          authentication, payment or approval logic.
        </p>
      </div>
    </section>
  );
}

function InfoCard({
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
