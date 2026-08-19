import { useEffect, useState } from 'react';
import { Bell, CheckCheck, X } from 'lucide-react';
import {
  getStudentNotifications,
  getTutorNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/lib/tuitionNotifications';

type Role = 'student' | 'tutor';

export default function TuitionNotificationCenter({ role }: { role: Role }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [unread, setUnread] = useState(0);
  const [message, setMessage] = useState('');

  const load = async () => {
    try {
      const result = role === 'student'
        ? await getStudentNotifications()
        : await getTutorNotifications();

      setItems(result.notifications || []);
      setUnread(result.unreadCount || 0);
    } catch (error: any) {
      setMessage(error.message || 'Unable to load notifications.');
    }
  };

  useEffect(() => {
    load();
    const timer = window.setInterval(load, 60000);
    return () => window.clearInterval(timer);
  }, [role]);

  const read = async (item: any) => {
    if (!item.is_read && !String(item.id).startsWith('announcement-')) {
      try {
        await markNotificationRead(item.id, role);
      } catch {
        // Keep the UI usable even if a read receipt fails.
      }
    }

    if (item.action_page) {
      window.location.hash = `#/${item.action_page}${item.action_id ? `/${item.action_id}` : ''}`;
      setOpen(false);
    }

    await load();
  };

  const readAll = async () => {
    try {
      await markAllNotificationsRead(role);
      await load();
    } catch (error: any) {
      setMessage(error.message || 'Unable to mark notifications as read.');
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Notifications"
        onClick={() => setOpen((value) => !value)}
        className="relative w-10 h-10 rounded-xl border bg-white flex items-center justify-center"
      >
        <Bell size={19} />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed md:absolute right-3 md:right-0 top-16 md:top-12 w-[calc(100vw-24px)] md:w-96 max-w-md bg-white border rounded-2xl shadow-xl z-50 overflow-hidden">
          <div className="p-4 border-b flex items-center justify-between">
            <div>
              <p className="font-black">Notifications</p>
              <p className="text-xs text-slate-500">{unread} unread</p>
            </div>
            <div className="flex items-center gap-1">
              <button type="button" onClick={readAll} className="p-2 rounded-lg hover:bg-slate-100" title="Mark all as read">
                <CheckCheck size={17} />
              </button>
              <button type="button" onClick={() => setOpen(false)} className="p-2 rounded-lg hover:bg-slate-100">
                <X size={17} />
              </button>
            </div>
          </div>

          {message && <p className="p-3 text-xs text-rose-600">{message}</p>}

          <div className="max-h-[70vh] overflow-y-auto">
            {items.map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => read(item)}
                className={`w-full text-left p-4 border-b last:border-b-0 hover:bg-slate-50 ${
                  !item.is_read ? 'bg-indigo-50/60' : ''
                }`}
              >
                <div className="flex gap-3">
                  <span className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                    !item.is_read ? 'bg-indigo-600' : 'bg-slate-300'
                  }`} />
                  <div className="min-w-0">
                    <p className="font-black text-sm">{item.title}</p>
                    <p className="text-xs text-slate-600 mt-1 leading-5">{item.message}</p>
                    <p className="text-[10px] text-slate-400 mt-2">
                      {item.created_at ? new Date(item.created_at).toLocaleString() : ''}
                    </p>
                  </div>
                </div>
              </button>
            ))}

            {!items.length && (
              <div className="p-10 text-center text-sm text-slate-400">
                You are all caught up.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
