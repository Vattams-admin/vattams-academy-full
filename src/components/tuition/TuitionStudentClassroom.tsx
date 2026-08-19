import { useEffect, useState } from 'react';
import { ExternalLink, FileText, PlayCircle, Video } from 'lucide-react';
import {
  getStudentClassroom,
  getStudentSession,
  joinStudentSession,
} from '@/lib/tuitionClassroom';

export default function TuitionStudentClassroom() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [message, setMessage] = useState('');

  const load = async () => {
    try {
      const result = await getStudentClassroom();
      setSessions(result.sessions || []);
      setMessage('');
    } catch (error: any) {
      setMessage(error.message || 'Unable to load classroom.');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openSession = async (id: string) => {
    try {
      setSelected(await getStudentSession(id));
      setMessage('');
    } catch (error: any) {
      setMessage(error.message || 'Unable to open class.');
    }
  };

  const join = async (id: string) => {
    try {
      const result = await joinStudentSession(id);
      if (result.session?.meetingUrl) {
        window.open(result.session.meetingUrl, '_blank', 'noopener,noreferrer');
      } else if (result.session?.recordingUrl) {
        window.open(result.session.recordingUrl, '_blank', 'noopener,noreferrer');
      } else {
        setMessage('This class does not have a meeting link yet.');
      }
    } catch (error: any) {
      setMessage(error.message || 'Unable to join class.');
    }
  };

  return (
    <section className="max-w-6xl mx-auto p-5 space-y-5">
      <div className="bg-white border rounded-3xl p-5">
        <p className="text-xs font-black uppercase text-indigo-600">VATTAMS Academy</p>
        <h1 className="text-2xl font-black mt-1">Online Classroom</h1>
        <p className="text-sm text-slate-500 mt-1">
          Your scheduled online classes, resources and recordings.
        </p>
        {message && (
          <p className="mt-4 rounded-xl bg-indigo-50 p-3 text-sm text-indigo-800">
            {message}
          </p>
        )}
      </div>

      <div className="grid lg:grid-cols-[1fr_1.25fr] gap-5">
        <div className="bg-white border rounded-3xl p-5">
          <h2 className="font-black">My Classes</h2>
          <div className="space-y-3 mt-4">
            {sessions.map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => openSession(item.id)}
                className={`w-full text-left rounded-2xl border p-4 ${
                  selected?.session?.id === item.id ? 'border-indigo-500 bg-indigo-50' : ''
                }`}
              >
                <p className="font-black">{item.title}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {new Date(item.scheduled_start).toLocaleString()}
                </p>
                <span className="inline-block mt-2 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black uppercase">
                  {item.status}
                </span>
              </button>
            ))}
            {!sessions.length && (
              <p className="text-sm text-slate-400 py-8 text-center">
                No classroom sessions are published for you yet.
              </p>
            )}
          </div>
        </div>

        <div className="bg-white border rounded-3xl p-5">
          {!selected ? (
            <div className="min-h-[300px] flex items-center justify-center text-center">
              <div>
                <Video className="mx-auto text-slate-300" size={42} />
                <p className="font-black mt-3">Select a class</p>
                <p className="text-sm text-slate-500 mt-1">
                  Class details and resources will appear here.
                </p>
              </div>
            </div>
          ) : (
            <>
              <p className="text-xs font-black uppercase text-indigo-600">
                {selected.session.status}
              </p>
              <h2 className="text-xl font-black mt-1">{selected.session.title}</h2>
              <p className="text-sm text-slate-500 mt-2">
                {selected.session.description || 'Online Academy class'}
              </p>

              <button
                type="button"
                onClick={() => join(selected.session.id)}
                className="mt-5 rounded-xl bg-indigo-600 text-white px-5 py-3 font-black inline-flex items-center gap-2"
              >
                <PlayCircle size={17} />
                {selected.session.status === 'completed' ? 'Open Recording' : 'Join Class'}
              </button>

              <div className="mt-6">
                <h3 className="font-black">Class Resources</h3>
                <div className="space-y-2 mt-3">
                  {(selected.resources || []).map((resource: any) => (
                    <a
                      key={resource.id}
                      href={resource.resource_url || '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl border p-3 flex items-center gap-3"
                    >
                      <FileText size={17} className="text-indigo-600" />
                      <span className="flex-1">
                        <span className="block text-sm font-black">{resource.title}</span>
                        <span className="block text-xs text-slate-500">
                          {resource.resource_type}
                        </span>
                      </span>
                      <ExternalLink size={15} />
                    </a>
                  ))}
                  {!selected.resources?.length && (
                    <p className="text-sm text-slate-400 py-4">
                      No resources published for this class.
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
