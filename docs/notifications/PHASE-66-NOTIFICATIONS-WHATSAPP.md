# VATTAMS Academy Phase 66 — Notifications + WhatsApp Communication Center

## Purpose
Create a unified notification and WhatsApp communication foundation.

## Notification channels
- In-app
- WhatsApp
- Email
- SMS

## Notification events
- Class reminder
- Assignment due
- Assignment graded
- Payment status
- Tutor approval
- Certificate issued
- Competition result
- System notification

## WhatsApp
The UI provides a user-controlled `wa.me` support link with a pre-filled message.

Automated WhatsApp Business messaging requires an approved WhatsApp Business API/provider and server-side credentials.

## Security
1. Never expose WhatsApp/API provider secrets in frontend code.
2. Server must authorize notification recipients.
3. Users must not receive another user's private notifications.
4. Transactional templates must be approved where provider policy requires it.
5. Delivery status should be recorded server-side.
6. Avoid sending sensitive payment/authentication information through ordinary messages.
7. Rate limiting and abuse controls are required for automated messaging.

## Data safety
No destructive database changes.
Existing authentication, payment, tutor, student and Tuition workflows remain preserved.
