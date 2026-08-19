import { useEffect, useState } from 'react';
import { Megaphone, Send } from 'lucide-react';
import {
  createAnnouncement,
  listAnnouncements,
  publishAnnouncement,
} from '@/lib/tuitionCommunications';

export default function TuitionAdminCommunications() {
  const [items, setItems] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    title: '',
    message: '',
    audience: 'all',
    priority: 'normal',
  });

  const load = async () => {
    try {
      const result = await listAnnouncements();
      setItems(result.announcements || []);
    } catch (e: any) {
      setMessage(e.message || 'Unable to load announcements.');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    if (!form.title || !form.message) {
      setMessage('Title and message are required.');
      return;
    }

    try {
      await createAnnouncement(form);
      setMessage('Announcement saved as draft.');
      setForm({ title: '', message: '', audience: 'all', priority: 'normal' });
      await load();
    } catch (e: any) {
      setMessage(e.message || 'Unable to create announcement.');
    }
  };

  const publish = async (id: string) => {
    try {
      await publishAnnouncement(id);
      setMessage('Announcement published and notifications sent.');
      await load();
    } catch (e: any) {
      setMessage(e.message || 'Unable to publish announcement.');
    }
  };

  return (
    <section className="space-y-5">
      {message && (
        <p className="rounded-xl bg-indigo-50 p-3 text-sm font-semibold text-indigo-800">
          {message}
        </p>
      )}

      <div className="bg-white border rounded-3xl p-5">
        <div className="flex items-center gap-3">
          <Send className="text-indigo-600" />
          <h2 className="text-xl font-black">Academy Announcement</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-3 mt-5">
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Announcement title"
            className="rounded-xl border p-3"
          />
          <select
            value={form.audience}
            onChange={(e) => setForm({ ...form, audience: e.target.value })}
            className="rounded-xl border p-3"
          >
            <option value="all">Everyone</option>
            <option value="students">Students</option>
            <option value="tutors">Tutors</option>
            <option value="admins">Admins</option>
          </select>
          <select
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value })}
            className="rounded-xl border p-3"
          >
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <textarea
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder="Write your announcement..."
          className="w-full mt-3 rounded-xl border p-3 min-h-28"
        />

        <button
          type="button"
          onClick={create}
          className="mt-3 rounded-xl bg-indigo-600 px-5 py-3 text-white font-black"
        >
          Save Draft
        </button>
      </div>

      <div className="bg-white border rounded-3xl p-5">
        <div className="flex items-center gap-3">
          <Megaphone className="text-amber-500" />
          <h2 className="text-xl font-black">Announcements</h2>
        </div>

        <div className="space-y-3 mt-4">
          {items.map((item) => (
            <div key={item.id} className="rounded-2xl border p-4">
              <p className="font-black">{item.title}</p>
              <p className="text-sm text-slate-600 mt-1">{item.message}</p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs font-bold text-slate-500">
                  {item.status} · {item.audience}
                </span>
                {item.status === 'draft' && (
                  <button
                    type="button"
                    onClick={() => publish(item.id)}
                    className="rounded-xl bg-emerald-600 px-4 py-2 text-white text-xs font-black"
                  >
                    Publish
                  </button>
                )}
              </div>
            </div>
          ))}

          {!items.length && (
            <p className="text-sm text-slate-400 text-center py-8">
              No announcements yet.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
