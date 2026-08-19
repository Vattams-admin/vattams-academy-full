import { useMemo, useState } from 'react';
import {
  CalendarCheck2,
  CheckCircle2,
  Clock3,
  GraduationCap,
  ShieldCheck,
  UserRoundX,
} from 'lucide-react';
import {
  calculateAttendanceSummary,
  type AttendanceRecord,
  type AttendanceStatus,
} from '@/lib/academyAttendance';

const DEMO_RECORDS: AttendanceRecord[] = [
  { id: 'a1', studentId: 'student-demo', courseId: 'math', classId: 'class-1', sessionDate: '2026-08-10', status: 'present' },
  { id: 'a2', studentId: 'student-demo', courseId: 'math', classId: 'class-2', sessionDate: '2026-08-11', status: 'present' },
  { id: 'a3', studentId: 'student-demo', courseId: 'math', classId: 'class-3', sessionDate: '2026-08-12', status: 'late' },
  { id: 'a4', studentId: 'student-demo', courseId: 'math', classId: 'class-4', sessionDate: '2026-08-13', status: 'absent' },
  { id: 'a5', studentId: 'student-demo', courseId: 'math', classId: 'class-5', sessionDate: '2026-08-14', status: 'present' },
];

export default function AcademyAttendanceCenter({
  initialRecords = DEMO_RECORDS,
}: {
  initialRecords?: AttendanceRecord[];
}) {
  const [records, setRecords] = useState(initialRecords);

  const summary = useMemo(
    () => calculateAttendanceSummary(records),
    [records],
  );

  const updateStatus = (id: string, status: AttendanceStatus) => {
    setRecords((current) =>
      current.map((record) =>
        record.id === id
          ? { ...record, status, markedAt: new Date().toISOString() }
          : record,
      ),
    );
  };

  return (
    <section className="space-y-5">
      <div className="bg-white border rounded-3xl p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-indigo-50 text-indigo-600 p-3">
            <CalendarCheck2 size={22} />
          </div>
          <div>
            <p className="text-xs font-black uppercase text-indigo-600">
              Attendance
            </p>
            <h2 className="text-2xl font-black mt-1">
              VATTAMS Academy Attendance Center
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Student attendance visibility and tutor/admin marking foundation.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Stat label="Attendance" value={`${summary.percentage}%`} />
        <Stat label="Present" value={summary.present} />
        <Stat label="Late" value={summary.late} />
        <Stat label="Absent" value={summary.absent} />
        <Stat label="Excused" value={summary.excused} />
      </div>

      <div className="bg-white border rounded-3xl p-5">
        <div className="flex items-center gap-2">
          <GraduationCap size={19} className="text-indigo-600" />
          <h3 className="font-black">Session Attendance</h3>
        </div>

        <div className="space-y-3 mt-4">
          {records.map((record) => (
            <div
              key={record.id}
              className="rounded-2xl bg-slate-50 p-4 flex flex-wrap items-center justify-between gap-3"
            >
              <div>
                <p className="font-black text-sm">
                  {new Date(record.sessionDate).toLocaleDateString('en-IN')}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {record.classId} · {record.courseId}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <StatusButton
                  active={record.status === 'present'}
                  onClick={() => updateStatus(record.id, 'present')}
                  label="Present"
                />
                <StatusButton
                  active={record.status === 'late'}
                  onClick={() => updateStatus(record.id, 'late')}
                  label="Late"
                />
                <StatusButton
                  active={record.status === 'absent'}
                  onClick={() => updateStatus(record.id, 'absent')}
                  label="Absent"
                />
                <StatusButton
                  active={record.status === 'excused'}
                  onClick={() => updateStatus(record.id, 'excused')}
                  label="Excused"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-5">
        <div className="flex gap-3">
          <ShieldCheck className="text-indigo-600 shrink-0" />
          <div>
            <p className="font-black text-indigo-950">
              Attendance security rule
            </p>
            <p className="text-sm text-indigo-900 mt-1">
              In production, only authorized tutors/admins should be able to
              mark or change attendance. Students should have read-only access
              to their own records.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5">
        <div className="flex gap-3">
          <UserRoundX className="text-amber-600 shrink-0" />
          <div>
            <p className="font-black text-amber-950">
              Certificate and progress integration
            </p>
            <p className="text-sm text-amber-900 mt-1">
              Attendance should contribute to progress/certificate eligibility
              only through server-validated records and the approved Academy policy.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white border rounded-3xl p-5 flex items-center gap-3">
        <Clock3 className="text-slate-500" />
        <div>
          <p className="font-black text-sm">Historical attendance</p>
          <p className="text-xs text-slate-500 mt-1">
            Existing historical records must remain immutable unless an authorized correction workflow exists.
          </p>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white border rounded-2xl p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-2xl font-black mt-1">{value}</p>
    </div>
  );
}

function StatusButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-3 py-2 text-xs font-black border ${
        active
          ? 'bg-indigo-600 text-white border-indigo-600'
          : 'bg-white text-slate-600'
      }`}
    >
      {active && <CheckCircle2 size={12} className="inline mr-1" />}
      {label}
    </button>
  );
}
