import { useMemo, useState } from 'react';
import {
  Bell,
  CheckCheck,
  ExternalLink,
  MessageCircle,
  Send,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import {
  buildWhatsAppUrl,
  getUnreadNotifications,
  markNotificationRead,
  type AcademyNotification,
} from '@/lib/academyNotifications';

const DEMO_PHONE = '918189800757';

const DEMO_NOTIFICATIONS: AcademyNotification[] = [
  {
    id: 'notification-1',
    recipientId: 'student-demo',
    type: 'class_reminder',
    title: 'Upcoming class',
    message: 'Your Mathematics class is scheduled for tomorrow.',
    channel: 'in_app',
    status: 'queued',
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'notification-2',
    recipientId: 'student-demo',
    type: 'assignment_due',
    title: 'Assignment reminder',
    message: 'Your Mathematics assignment is due soon.',
    channel: 'in_app',
    status: 'queued',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'notification-3',
    recipientId: 'student-demo',
    type: 'system',
    title: 'Welcome to VATTAMS Academy',
    message: 'Your Academy account is ready.',
    channel: 'in_app',
    status: 'read',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    readAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
  },
];

export default function AcademyNotificationsWhatsAppCenter({
  initialNotifications = DEMO_NOTIFICATIONS,
  whatsappPhone = DEMO_PHONE,
}: {
  initialNotifications?: AcademyNotification[];
  whatsappPhone?: string;
}) {
  const [notifications, setNotifications] =
    useState(initialNotifications);
  const [message, setMessage] = useState('');

  const unread = useMemo(
    () => getUnreadNotifications(notifications, 'student-demo'),
    [notifications],
  );

  const markRead = (id: string) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id
          ? markNotificationRead(notification)
          : notification,
      ),
    );
  };

  const whatsappMessage =
    'VATTAMS Academy - Hello. I would like assistance regarding my Academy account.';

  const whatsappUrl = buildWhatsAppUrl(
    whatsappPhone,
    whatsappMessage,
  );

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
                VATTAMS Academy
              </p>
              <h2 className="text-2xl font-black mt-1">
                Notifications & WhatsApp
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Central communication foundation for students, tutors and admins.
              </p>
            </div>
          </div>

          <span className="rounded-xl bg-amber-50 text-amber-700 px-4 py-2 text-sm font-black">
            {unread.length} unread
          </span>
        </div>
      </div>

      <div className="bg-white border rounded-3xl p-5">
        <div className="flex items-center gap-2">
          <Bell size={19} className="text-indigo-600" />
          <h3 className="font-black">My Notifications</h3>
        </div>

        <div className="space-y-3 mt-4">
          {notifications
            .filter((notification) => notification.recipientId === 'student-demo')
            .map((notification) => (
              <article
                key={notification.id}
                className={`rounded-2xl p-4 ${
                  notification.status === 'read'
                    ? 'bg-slate-50'
                    : 'bg-indigo-50 border border-indigo-100'
                }`}
              >
                <div className="flex flex-wrap justify-between gap-3">
                  <div>
                    <p className="font-black">{notification.title}</p>
                    <p className="text-sm text-slate-600 mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-slate-400 mt-2">
                      {new Date(notification.createdAt).toLocaleString('en-IN')}
                    </p>
                  </div>

                  {notification.status !== 'read' ? (
                    <button
                      type="button"
                      onClick={() => markRead(notification.id)}
                      className="self-start rounded-xl bg-white border px-3 py-2 text-xs font-black inline-flex items-center gap-2"
                    >
                      <CheckCheck size={14} /> Mark Read
                    </button>
                  ) : (
                    <span className="self-start rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-black">
                      Read
                    </span>
                  )}
                </div>
              </article>
            ))}

          {notifications.length === 0 && (
            <p className="text-sm text-slate-500">No notifications.</p>
          )}
        </div>
      </div>

      <div className="bg-white border rounded-3xl p-5">
        <div className="flex items-center gap-2">
          <MessageCircle size={19} className="text-emerald-600" />
          <h3 className="font-black">WhatsApp Support</h3>
        </div>

        <p className="text-sm text-slate-500 mt-2">
          Open WhatsApp with a pre-filled support message. The user controls
          whether the message is actually sent.
        </p>

        <div className="flex flex-wrap gap-2 mt-4">
          {whatsappUrl ? (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl bg-emerald-600 text-white px-5 py-3 font-black inline-flex items-center gap-2"
            >
              <Send size={16} /> Open WhatsApp
            </a>
          ) : (
            <span className="rounded-xl bg-slate-100 px-5 py-3 text-sm font-bold">
              WhatsApp number is not configured.
            </span>
          )}

          <button
            type="button"
            onClick={() =>
              setMessage(
                'WhatsApp automation requires an approved WhatsApp Business API/provider configuration.',
              )
            }
            className="rounded-xl border px-5 py-3 font-black inline-flex items-center gap-2"
          >
            <ExternalLink size={16} /> API Automation Info
          </button>
        </div>

        {message && (
          <p className="mt-4 rounded-2xl bg-indigo-50 p-4 text-sm font-bold text-indigo-900">
            {message}
          </p>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        <ChannelCard
          icon={<Bell size={19} />}
          title="In-App"
          description="Class, assignment, payment and result notifications."
        />
        <ChannelCard
          icon={<MessageCircle size={19} />}
          title="WhatsApp"
          description="User-controlled support and approved transactional messaging."
        />
        <ChannelCard
          icon={<Smartphone size={19} />}
          title="SMS/Email"
          description="Optional provider integrations for critical notifications."
        />
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5">
        <div className="flex gap-3">
          <ShieldCheck className="text-amber-600 shrink-0" />
          <div>
            <p className="font-black text-amber-950">
              Communication security
            </p>
            <p className="text-sm text-amber-900 mt-1">
              Automated WhatsApp/SMS/email delivery must run through an approved
              server-side provider. Never expose provider secrets or API tokens
              in the browser.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-5">
        <p className="font-black text-indigo-950">
          Notification events planned
        </p>
        <p className="text-sm text-indigo-900 mt-1">
          Class reminders · Assignment due · Assignment graded · Payment status ·
          Tutor approval · Certificate issued · Competition results · System alerts.
        </p>
      </div>
    </section>
  );
}

function ChannelCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white border rounded-2xl p-4">
      <div className="text-indigo-600">{icon}</div>
      <p className="font-black mt-3">{title}</p>
      <p className="text-xs text-slate-500 mt-1">{description}</p>
    </div>
  );
}
