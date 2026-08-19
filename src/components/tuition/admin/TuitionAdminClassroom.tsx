import { useEffect, useState } from 'react';
import { CheckCircle2, RefreshCw } from 'lucide-react';
import {
  listAttendance,
  listMyClasses,
  markAttendance,
} from '@/lib/tuitionClassroom';

export default function TuitionAdminClassroom() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [selected, setSelected] = useState<string>('');
  const [attendance, setAttendance] = useState<any[]>([]);

  const load = async () => {
    try {
      const result = await listMyClasses();
      setSessions(result.sessions || []);
    } catch (e: any) {
      setMessage(e.message || 'Unable to load classroom sessions.');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const loadAttendance = async (id: string) => {
    setSelected(id);
    try {
      const result = await listAttendance(id);
      setAttendance(result.attendance || []);
    } catch (e: any) {
      setMessage(e.message || 'Unable to load attendance.');
    }
  };

  const mark = async (session: any, studentStatus: string) => {
    try {
      await markAttendance({
        sessionId: session.id,
        studentStatus,
        tutorStatus: session.tutor_joined_at ? 'present' : 'pending',
        minutesAttended: session.student_joined_at ? 60 : 0,
      });
      setMessage('Attendance updated.');
      await loadAttendance(session.id);
    } catch (e: any) {
      setMessage(e.message || 'Unable to update attendance.');
    }
  };

  return (
    <section className="bg-white border rounded-3xl p-5">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-xs font-black uppercase text-indigo-600">
            Admin Classroom
          </p>
          <h2 className="text-xl font-black">Class Sessions & Attendance</h2>
        </div>
        <button type="button" onClick={load} className="p-2 rounded-xl border">
          <RefreshCw size={17} />
        </button>
      </div>

      {message && (
        <p className="mt-3 rounded-xl bg-indigo-50 p-3 text-sm font-semibold text-indigo-800">
          {message}
        </p>
      )}

      <div className="space-y-3 mt-5">
        {sessions.map((session) => (
          <div key={session.id} className="rounded-2xl border p-4">
            <p className="font-black">{session.title}</p>
            <p className="text-xs text-slate-500">
              {new Date(session.scheduled_start_at).toLocaleString()}
            </p>
            <p className="text-xs text-slate-500">
              Student: {session.student_id || '—'}
            </p>
            <p className="text-xs text-slate-500">
              Tutor: {session.tutor_id || '—'}
            </p>

            <div className="flex flex-wrap gap-2 mt-3">
              <button
                type="button"
                onClick={() => loadAttendance(session.id)}
                className="px-3 py-2 rounded-xl border text-xs font-black"
              >
                View Attendance
              </button>
              <button
                type="button"
                onClick={() => mark(session, 'present')}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-black"
              >
                <CheckCircle2 size={15} />
                Mark Present
              </button>
              <button
                type="button"
                onClick={() => mark(session, 'absent')}
                className="px-3 py-2 rounded-xl bg-red-50 text-red-700 text-xs font-black"
              >
                Mark Absent
              </button>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="mt-5 rounded-2xl bg-slate-50 p-4">
          <h3 className="font-black">Attendance</h3>
          <div className="space-y-2 mt-3">
            {attendance.map((item) => (
              <div key={item.id} className="rounded-xl bg-white border p-3 text-sm">
                <p className="font-bold">
                  Student: {item.student_id || '—'}
                </p>
                <p className="text-xs text-slate-500">
                  Student: {item.student_status} · Tutor: {item.tutor_status}
                </p>
                <p className="text-xs text-slate-500">
                  Minutes: {item.minutes_attended}
                </p>
              </div>
            ))}
            {!attendance.length && (
              <p className="text-xs text-slate-400">No attendance record yet.</p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
