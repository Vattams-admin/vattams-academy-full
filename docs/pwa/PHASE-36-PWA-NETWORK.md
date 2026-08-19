# VATTAMS Academy Phase 36 — PWA & Network Resilience

## Added
- Academy PWA manifest
- Academy service worker
- Install prompt support
- Standalone-app detection
- Network online/offline detection
- Mobile offline banner
- Network quality information utility

## Security rule
Authentication, Supabase REST requests, Edge Functions, API requests and dynamic Academy data are intentionally NOT cached by the service worker.

## Important
Offline mode is a shell/resilience feature, not an offline-login system. Protected actions such as payment, assignment submission, test submission and other server-dependent operations should wait for a working connection.

## Login reliability
Phase 35 remains the source of truth for server-side session validation. Phase 36 does not replace or weaken authentication.
