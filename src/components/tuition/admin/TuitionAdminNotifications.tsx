import { useEffect, useState } from 'react';
import { BellRing, Megaphone, Send } from 'lucide-react';
import {
  createAnnouncement,
  createNotification,
  getAdminAnnouncements,
  publishAnnouncement,
} from '@/lib/tuitionNotifications';

export default function TuitionAdminNotifications() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [announcement, setAnnouncement] = useState({
    title: '',
    message: '',
    audience: 'all',
    priority: 'normal',
    expiresAt: '',
  });
  const [notification, setNotification] = useState({
    recipientRole: 'all',
    recipientId: '',
    notificationType: 'general',
    title: '',
    message: '',
    priority: 'normal',
  });
  const [message, setMessage] = useState('');

  const load = async () => {
    try {
      const result = await getAdminAnnouncements();
      setAnnouncements(result.announcements || []);
    } catch (error: any) {
      setMessage(error.message || 'Unable to load announcements.');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const makeAnnouncement = async () => {
    try {
      await createAnnouncement({
        ...announcement,
        status: 'published',
        publishAt: new Date().toISOString(),
        expiresAt: announcement.expiresAt
          ? new Date(announcement.expiresAt).toISOString()
          : null,
      });
      setAnnouncement({
        title: '',
        message: '',
        audience: 'all',
        priority: 'normal',
        expiresAt: '',
      });
      setMessage('Announcement published.');
      await load();
    } catch (error: any) {
      setMessage(error.message || 'Unable to publish announcement.');
    }
  };

  const send = async () => {
    try {
      await createNotification({
        ...notification,
        recipientId: notification.recipientRole === 'all'
          ? null
          : notification.recipientId || null,
      });
      setNotification({
        ...notification,
        title: '',
        message: '',
        recipientId: '',
      });
      setMessage('Notification sent.');
    } catch (error: any) {
      setMessage(error.message || 'Unable to send notification.');
    }
  };

  return (
    <section className="space-y-5">
      <div className="bg-white border rounded-3xl p-5">
        <div className="flex items-center gap-2">
          <Megaphone className="text-indigo-600" />
          <div>
            <p className="text-xs font-black uppercase text-indigo-600">Academy Admin</p>
            <h2 className="text-xl font-black">Announcements</h2>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-3 mt-5">
          <input
            value={announcement.title}
            onChange={(e) => setAnnouncement({...announcement, title: e.target.value})}
            placeholder="Announcement title"
            className="rounded-xl border p-3"
          />
          <select
            value={announcement.audience}
            onChange={(e) => setAnnouncement({...announcement, audience: e.target.value})}
            className="rounded-xl border p-3"
          >
            <option value="all">Everyone</option>
            <option value="students">Students</option>
            <option value="tutors">Tutors</option>
            <option value="admins">Admins</option>
          </select>
          <select
            value={announcement.priority}
            onChange={(e) => setAnnouncement({...announcement, priority: e.target.value})}
            className="rounded-xl border p-3"
          >
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
          <input
            type="datetime-local"
            value={announcement.expiresAt}
            onChange={(e) => setAnnouncement({...announcement, expiresAt: e.target.value})}
            className="rounded-xl border p-3"
          />
          <textarea
            value={announcement.message}
            onChange={(e) => setAnnouncement({...announcement, message: e.target.value})}
            placeholder="Announcement message"
            className="rounded-xl border p-3 md:col-span-2 min-h-28"
          />
        </div>

        <button
          type="button"
          onClick={makeAnnouncement}
          className="mt-4 rounded-xl bg-indigo-600 text-white px-5 py-3 font-black inline-flex items-center gap-2"
        >
          <Megaphone size={16} /> Publish Announcement
        </button>
      </div>

      <div className="bg-white border rounded-3xl p-5">
        <div className="flex items-center gap-2">
          <BellRing className="text-amber-500" />
          <h2 className="font-black">Direct Notification</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-3 mt-5">
          <select
            value={notification.recipientRole}
            onChange={(e) => setNotification({...notification, recipientRole: e.target.value})}
            className="rounded-xl border p-3"
          >
            <option value="all">All users</option>
            <option value="student">Student</option>
            <option value="tutor">Tutor</option>
            <option value="admin">Admin</option>
          </select>

          <input
            value={notification.recipientId}
            onChange={(e) => setNotification({...notification, recipientId: e.target.value})}
            placeholder="Recipient ID (optional for all)"
            className="rounded-xl border p-3"
          />

          <select
            value={notification.notificationType}
            onChange={(e) => setNotification({...notification, notificationType: e.target.value})}
            className="rounded-xl border p-3"
          >
            <option value="general">General</option>
            <option value="class">Class</option>
            <option value="assignment">Assignment</option>
            <option value="test">Test</option>
            <option value="competition">Competition</option>
            <option value="certificate">Certificate</option>
            <option value="attendance">Attendance</option>
            <option value="payment">Payment</option>
            <option value="system">System</option>
          </select>

          <select
            value={notification.priority}
            onChange={(e) => setNotification({...notification, priority: e.target.value})}
            className="rounded-xl border p-3"
          >
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>

          <input
            value={notification.title}
            onChange={(e) => setNotification({...notification, title: e.target.value})}
            placeholder="Notification title"
            className="rounded-xl border p-3 md:col-span-2"
          />

          <textarea
            value={notification.message}
            onChange={(e) => setNotification({...notification, message: e.target.value})}
            placeholder="Notification message"
            className="rounded-xl border p-3 md:col-span-2 min-h-24"
          />
        </div>

        <button
          type="button"
          onClick={send}
          className="mt-4 rounded-xl bg-slate-900 text-white px-5 py-3 font-black inline-flex items-center gap-2"
        >
          <Send size={16} /> Send Notification
        </button>
      </div>

      {message && <p className="rounded-xl bg-indigo-50 p-3 text-sm text-indigo-800">{message}</p>}

      <div className="bg-white border rounded-3xl p-5">
        <h3 className="font-black">Recent Announcements</h3>
        <div className="space-y-3 mt-4">
          {announcements.map((item) => (
            <div key={item.id} className="rounded-2xl border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-black">{item.title}</p>
                <span className="text-[10px] uppercase font-black rounded-full bg-slate-100 px-2 py-1">
                  {item.status}
                </span>
              </div>
              <p className="text-sm text-slate-600 mt-2">{item.message}</p>
              <p className="text-xs text-slate-400 mt-2">
                Audience: {item.audience} · {new Date(item.created_at).toLocaleString()}
              </p>
              {item.status === 'draft' && (
                <button
                  type="button"
                  onClick={async () => {
                    await publishAnnouncement(item.id);
                    await load();
                  }}
                  className="mt-3 rounded-lg border px-3 py-2 text-xs font-black"
                >
                  Publish
                </button>
              )}
            </div>
          ))}
          {!announcements.length && <p className="text-sm text-slate-400 py-5">No announcements yet.</p>}
        </div>
      </div>
    </section>
  );
}
