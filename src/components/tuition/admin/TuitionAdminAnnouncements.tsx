import { useState } from 'react';
import { Megaphone, Send } from 'lucide-react';
import { sendAnnouncement } from '@/lib/tuitionNotifications';

export default function TuitionAdminAnnouncements() {
  const [recipientRole, setRecipientRole] = useState('student');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [actionUrl, setActionUrl] = useState('');
  const [status, setStatus] = useState('');

  const send = async () => {
    if (!title.trim() || !message.trim()) {
      setStatus('Title and message are required.');
      return;
    }

    try {
      const result = await sendAnnouncement({
        recipientRole,
        title,
        message,
        actionUrl: actionUrl || null,
      });

      setStatus(`Announcement sent to ${result.sent} users.`);
      setTitle('');
      setMessage('');
      setActionUrl('');
    } catch (e: any) {
      setStatus(e.message || 'Unable to send announcement.');
    }
  };

  return (
    <section className="bg-white border rounded-3xl p-5">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
          <Megaphone size={19} />
        </div>
        <div>
          <p className="text-xs font-black uppercase text-indigo-600">
            Communication
          </p>
          <h2 className="text-xl font-black">Academy Announcement</h2>
        </div>
      </div>

      <div className="space-y-3 mt-5">
        <select
          value={recipientRole}
          onChange={(e) => setRecipientRole(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border"
        >
          <option value="student">All Students</option>
          <option value="tutor">All Tutors</option>
          <option value="admin">All Admins</option>
        </select>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Announcement title"
          className="w-full px-4 py-3 rounded-xl border"
        />

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Announcement message"
          className="w-full min-h-28 px-4 py-3 rounded-xl border"
        />

        <input
          value={actionUrl}
          onChange={(e) => setActionUrl(e.target.value)}
          placeholder="Optional action URL"
          className="w-full px-4 py-3 rounded-xl border"
        />

        <button
          type="button"
          onClick={send}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 text-white font-black"
        >
          <Send size={17} />
          Send Announcement
        </button>

        {status && (
          <p className="text-sm font-semibold text-indigo-700 bg-indigo-50 rounded-xl p-3">
            {status}
          </p>
        )}
      </div>
    </section>
  );
}
