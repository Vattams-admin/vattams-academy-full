export type NotificationChannel = 'in_app' | 'whatsapp' | 'email' | 'sms';

export type NotificationType =
  | 'class_reminder'
  | 'assignment_due'
  | 'assignment_graded'
  | 'payment_status'
  | 'tutor_approval'
  | 'certificate_issued'
  | 'competition_result'
  | 'system';

export type NotificationStatus = 'queued' | 'sent' | 'failed' | 'read';

export type AcademyNotification = {
  id: string;
  recipientId: string;
  type: NotificationType;
  title: string;
  message: string;
  channel: NotificationChannel;
  status: NotificationStatus;
  createdAt: string;
  readAt?: string;
};

export type WhatsAppTemplate = {
  key: string;
  name: string;
  body: string;
  active: boolean;
};

export function getUnreadNotifications(
  notifications: AcademyNotification[],
  recipientId: string,
) {
  return notifications.filter(
    (notification) =>
      notification.recipientId === recipientId &&
      notification.status !== 'read',
  );
}

export function markNotificationRead(
  notification: AcademyNotification,
) {
  return {
    ...notification,
    status: 'read' as const,
    readAt: new Date().toISOString(),
  };
}

export function buildWhatsAppUrl(
  phone: string,
  message: string,
) {
  const digits = phone.replace(/\D/g, '');
  if (!digits) return '';
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function createNotification(input: {
  recipientId: string;
  type: NotificationType;
  title: string;
  message: string;
  channel?: NotificationChannel;
}): AcademyNotification {
  return {
    id: `notification-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    recipientId: input.recipientId,
    type: input.type,
    title: input.title,
    message: input.message,
    channel: input.channel || 'in_app',
    status: 'queued',
    createdAt: new Date().toISOString(),
  };
}
