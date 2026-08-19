import { useEffect, useState } from 'react';
import { CalendarPlus, Link2, Plus, Video } from 'lucide-react';
import {
  addClassroomResource,
  createClassroomSession,
  getTutorClassroom,
} from '@/lib/tuitionClassroom';

export default function TuitionTutorClassroom() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    scheduledStart: '',
    scheduledEnd: '',
    meetingUrl: '',
    meetingProvider: 'Google Meet',
    courseId: '',
  });
  const [resource, setResource] = useState({
    sessionId: '',
    title: '',
    resourceType: 'material',
    resourceUrl: '',
  });
  const [message, setMessage] = useState('');

  const load = async () => {
    try {
      const result = await getTutorClassroom();
      setSessions(result.sessions || []);
      setMessage('');
    } catch (error: any) {
      setMessage(error.message || 'Unable to load tutor classroom.');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    try {
      await createClassroomSession({
        ...form,
        isPublished: true,
      });
      setForm({
        title: '',
        description: '',
        scheduledStart: '',
        scheduledEnd: '',
        meetingUrl: '',
        meetingProvider: 'Google Meet',
        courseId: '',
      });
      await load();
      setMessage('Class session created and published.');
    } catch (error: any) {
      setMessage(error.message || 'Unable to create class session.');
    }
  };

  const addResource = async () => {
    try {
      await addClassroomResource({
        ...resource,
        isPublished: true,
      });
      setResource({
        sessionId: '',
        title: '',
        resourceType: 'material',
        resourceUrl: '',
      });
      setMessage('Resource published.');
    } catch (error: any) {
      setMessage(error.message || 'Unable to publish resource.');
    }
  };

  return (
    <section className="max-w-6xl mx-auto p-5 space-y-5">
      <div className="bg-white border rounded-3xl p-5">
        <p className="text-xs font-black uppercase text-indigo-600">Tutor Portal</p>
        <h1 className="text-2xl font-black mt-1">Online Classroom</h1>
        {message && (
          <p className="mt-4 rounded-xl bg-indigo-50 p-3 text-sm text-indigo-800">
            {message}
          </p>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="bg-white border rounded-3xl p-5">
          <div className="flex items-center gap-2">
            <CalendarPlus className="text-indigo-600" />
            <h2 className="font-black">Create Class</h2>
          </div>

          <div className="space-y-3 mt-4">
            <input value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} placeholder="Class title" className="w-full rounded-xl border p-3" />
            <textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} placeholder="Description" className="w-full rounded-xl border p-3" />
            <input type="datetime-local" value={form.scheduledStart} onChange={(e) => setForm({...form, scheduledStart: new Date(e.target.value).toISOString()})} className="w-full rounded-xl border p-3" />
            <input type="datetime-local" value={form.scheduledEnd} onChange={(e) => setForm({...form, scheduledEnd: new Date(e.target.value).toISOString()})} className="w-full rounded-xl border p-3" />
            <input value={form.meetingUrl} onChange={(e) => setForm({...form, meetingUrl: e.target.value})} placeholder="Meeting URL" className="w-full rounded-xl border p-3" />
            <input value={form.meetingProvider} onChange={(e) => setForm({...form, meetingProvider: e.target.value})} placeholder="Meeting provider" className="w-full rounded-xl border p-3" />
          </div>

          <button type="button" onClick={create} className="mt-4 rounded-xl bg-indigo-600 text-white px-5 py-3 font-black inline-flex gap-2 items-center">
            <Plus size={17} /> Create & Publish
          </button>
        </div>

        <div className="bg-white border rounded-3xl p-5">
          <div className="flex items-center gap-2">
            <Link2 className="text-indigo-600" />
            <h2 className="font-black">Publish Resource</h2>
          </div>

          <div className="space-y-3 mt-4">
            <select value={resource.sessionId} onChange={(e) => setResource({...resource, sessionId: e.target.value})} className="w-full rounded-xl border p-3">
              <option value="">Select class</option>
              {sessions.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
            </select>
            <input value={resource.title} onChange={(e) => setResource({...resource, title: e.target.value})} placeholder="Resource title" className="w-full rounded-xl border p-3" />
            <select value={resource.resourceType} onChange={(e) => setResource({...resource, resourceType: e.target.value})} className="w-full rounded-xl border p-3">
              <option value="material">Material</option>
              <option value="link">Link</option>
              <option value="recording">Recording</option>
              <option value="assignment">Assignment</option>
              <option value="other">Other</option>
            </select>
            <input value={resource.resourceUrl} onChange={(e) => setResource({...resource, resourceUrl: e.target.value})} placeholder="Resource URL" className="w-full rounded-xl border p-3" />
          </div>

          <button type="button" onClick={addResource} className="mt-4 rounded-xl border px-5 py-3 font-black">
            Publish Resource
          </button>
        </div>
      </div>

      <div className="bg-white border rounded-3xl p-5">
        <div className="flex items-center gap-2">
          <Video className="text-indigo-600" />
          <h2 className="font-black">My Classroom Sessions</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-3 mt-4">
          {sessions.map((item) => (
            <div key={item.id} className="rounded-2xl border p-4">
              <p className="font-black">{item.title}</p>
              <p className="text-xs text-slate-500 mt-1">{new Date(item.scheduled_start).toLocaleString()}</p>
              <span className="inline-block mt-2 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black uppercase">{item.status}</span>
              <p className="text-xs mt-2 break-all">{item.meeting_url || 'No meeting URL'}</p>
            </div>
          ))}
          {!sessions.length && <p className="text-sm text-slate-400 py-6">No classroom sessions yet.</p>}
        </div>
      </div>
    </section>
  );
}
