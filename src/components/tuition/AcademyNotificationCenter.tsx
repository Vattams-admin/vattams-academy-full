import { useMemo, useState } from 'react';
import {
  AlertCircle,
  Award,
  Bell,
  BookOpen,
  CheckCircle2,
  CreditCard,
  GraduationCap,
  Megaphone,
  TestTube2,
} from 'lucide-react';
import {
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
  sortNotifications,
  type AcademyNotification,
  type AcademyNotificationType,
} from '@/lib/academyNotifications';

const DEMO_NOTIFICATIONS: AcademyNotification[] = [
  {
    id: 'n1',
    type: 'class',
    title: 'Upcoming class',
    message: 'Your Mathematics class is scheduled for tomorrow.',
    createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    read: false,
    actionLabel: 'View Class',
    actionRoute: '#/classroom',
  },
  {
    id: 'n2',
    type: 'assignment',
    title: 'Assignment reminder',
    message: 'A pending assignment is waiting for your submission.',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: false,
    actionLabel: 'Open Assignment',
    actionRoute: '#/assignments',
  },
  {
    id: 'n3',
    type: 'result',
    title: 'Result published',
    message: 'Your latest assessment result is now available.',
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    read: true,
    actionLabel: 'View Result',
    actionRoute: '#/results',
  },
  {
    id: 'n4',
    type: 'certificate',
    title: 'Certificate update',
    message: 'Your certificate eligibility has been updated.',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    read: true,
    actionLabel: 'View Certificate',
    actionRoute: '#/certificates',
  },
  {
    id: 'n5',
    type: 'announcement',
    title: 'Academy announcement',
    message: 'Welcome to the latest VATTAMS Academy learning updates.',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    read: true,
  },
];

export default function AcademyNotificationCenter({
  initialNotifications = DEMO_NOTIFICATIONS,
}: {
  initialNotifications?: AcademyNotification[];
}) {
  const [notifications, setNotifications] =
    useState<AcademyNotification[]>(initialNotifications);

  const sorted = useMemo(
    () => sortNotifications(notifications),
    [notifications],
  );

  const unread = getUnreadNotificationCount(notifications);

  const markRead = (id: string) => {
    setNotifications((current) => markNotificationRead(current, id));
  };

  const markAllRead = () => {
    setNotifications((current) => markAllNotificationsRead(current));
  };

  return (
    <section className="space-y-5">
      <div className="bg-white border rounded-3xl p-5">
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-indigo-50 text-indigo-600 p-3">
              <Bell size={22} />
            </div>
            <div>
              <p className="text-xs font-black uppercase text-indigo-600">
                Notifications
              </p>
              <h2 className="text-2xl font-black mt-1">
                VATTAMS Academy Notification Center
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Keep students, tutors and administrators informed about important Academy events.
              </p>
            </div>
          </div>

          {unread > 0 && (
            <button
              type="button"
              onClick={markAllRead}
              className="rounded-xl border px-4 py-2 font-black"
            >
              Mark all as read
            </button>
          )}
        </div>

        <div className="mt-5 rounded-2xl bg-indigo-50 p-4">
          <p className="text-xs text-indigo-700 font-black uppercase">
            Unread
          </p>
          <p className="text-3xl font-black text-indigo-950 mt-1">
            {unread}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {sorted.map((notification) => (
          <NotificationCard
            key={notification.id}
            notification={notification}
            onRead={() => markRead(notification.id)}
          />
        ))}

        {sorted.length === 0 && (
          <div className="bg-white border rounded-3xl p-8 text-center">
            <CheckCircle2 className="mx-auto text-emerald-600" />
            <p className="font-black mt-3">You're all caught up.</p>
          </div>
        )}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5">
        <div className="flex gap-3">
          <AlertCircle className="text-amber-600 shrink-0" />
          <div>
            <p className="font-black text-amber-950">
              Production notification delivery
            </p>
            <p className="text-sm text-amber-900 mt-1">
              This phase provides the notification UI and state helpers.
              Production delivery should use the approved backend notification
              path, with role-based access and server-side authorization.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function NotificationCard({
  notification,
  onRead,
}: {
  notification: AcademyNotification;
  onRead: () => void;
}) {
  return (
    <article
      className={`bg-white border rounded-3xl p-5 ${
        notification.read ? '' : 'ring-2 ring-indigo-100'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-slate-50 p-3">
          <NotificationIcon type={notification.type} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap justify-between gap-2">
            <h3 className="font-black">{notification.title}</h3>
            {!notification.read && (
              <span className="rounded-full bg-indigo-600 text-white px-2 py-1 text-[10px] font-black uppercase">
                New
              </span>
            )}
          </div>

          <p className="text-sm text-slate-600 mt-1">
            {notification.message}
          </p>

          <p className="text-xs text-slate-400 mt-3">
            {new Date(notification.createdAt).toLocaleString('en-IN')}
          </p>

          <div className="flex flex-wrap gap-2 mt-4">
            {notification.actionLabel && notification.actionRoute && (
              <a
                href={notification.actionRoute}
                onClick={onRead}
                className="rounded-xl bg-indigo-600 text-white px-4 py-2 text-sm font-black"
              >
                {notification.actionLabel}
              </a>
            )}

            {!notification.read && (
              <button
                type="button"
                onClick={onRead}
                className="rounded-xl border px-4 py-2 text-sm font-black"
              >
                Mark as read
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function NotificationIcon({ type }: { type: AcademyNotificationType }) {
  if (type === 'class') return <GraduationCap size={19} className="text-indigo-600" />;
  if (type === 'assignment') return <BookOpen size={19} className="text-indigo-600" />;
  if (type === 'test') return <TestTube2 size={19} className="text-indigo-600" />;
  if (type === 'result') return <CheckCircle2 size={19} className="text-emerald-600" />;
  if (type === 'certificate') return <Award size={19} className="text-amber-600" />;
  if (type === 'payment') return <CreditCard size={19} className="text-indigo-600" />;
  if (type === 'announcement') return <Megaphone size={19} className="text-indigo-600" />;
  return <Bell size={19} className="text-slate-600" />;
}
