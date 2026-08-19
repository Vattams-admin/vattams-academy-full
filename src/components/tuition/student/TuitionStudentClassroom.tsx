import { useEffect, useState } from 'react';
import { CalendarClock, ExternalLink, LogIn, RefreshCw } from 'lucide-react';
import {
  joinClassSession,
  leaveClassSession,
  listMyClasses,
} from '@/lib/tuitionClassroom';

export default function TuitionStudentClassroom() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [message, setMessage] = useState('');

  const load = async () => {
    try {
      const result = await listMyClasses();
      setSessions(result.sessions || []);
    } catch (e: any) {
      setMessage(e.message || 'Unable to load classes.');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const join = async (id: string) => {
    try {
      const result = await joinClassSession(id);
      if (result.meetingUrl) {
        window.open(result.meetingUrl, '_blank', 'noopener,noreferrer');
      } else {
        setMessage('Classroom opened, but no meeting link is configured yet.');
      }
      await load();
    } catch (e: any) {
      setMessage(e.message || 'Unable to join class.');
    }
  };

  const leave = async (id: string) => {
    try {
      await leaveClassSession(id);
      setMessage('Class exit recorded.');
      await load();
    } catch (e: any) {
      setMessage(e.message || 'Unable to record class exit.');
    }
  };

  return (
    <section className="bg-white border rounded-3xl p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-black uppercase text-indigo-600">
            Student Classroom
          </p>
          <h2 className="text-xl font-black">My Live Classes</h2>
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
            <div className="flex gap-3">
              <CalendarClock className="text-indigo-600 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-black">{session.title}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {new Date(session.scheduled_start_at).toLocaleString()}
                </p>
                <p className="text-xs text-slate-500">
                  Status: {session.status}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {['scheduled', 'live'].includes(session.status) && (
                <button
                  type="button"
                  onClick={() => join(session.id)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-black"
                >
                  <LogIn size={16} />
                  Join Class
                </button>
              )}

              {session.student_joined_at && !session.student_left_at && (
                <button
                  type="button"
                  onClick={() => leave(session.id)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-black"
                >
                  <ExternalLink size={16} />
                  Leave / Record Exit
                </button>
              )}
            </div>
          </div>
        ))}

        {!sessions.length && (
          <p className="text-sm text-slate-400 text-center py-8">
            No scheduled classes yet.
          </p>
        )}
      </div>
    </section>
  );
}
