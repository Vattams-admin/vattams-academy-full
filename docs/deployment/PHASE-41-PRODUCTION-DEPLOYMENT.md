# VATTAMS Academy Phase 41 — Production Deployment Readiness

## Purpose
Phase 41 prepares the existing VATTAMS Academy release candidate for the production deployment decision.

## Added
- Public environment detection
- Public configuration readiness check
- HTTPS/secure-context check
- Service Worker support check
- Network check
- Deployment-readiness dashboard
- Production secret-safety documentation

## Required production environment variables
Only public frontend configuration may be exposed to the browser, for example:
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY or the project's approved publishable key
- VITE_APP_ENV=production

Never expose:
- Supabase service-role key
- Database passwords
- Payment gateway secret keys
- Private API keys
- JWT signing secrets
- SMTP passwords
- Any server credential

## Deployment sequence
1. Confirm the exact approved Phase 40 release candidate.
2. Confirm production Supabase project.
3. Confirm managed database backup.
4. Confirm all required Edge Functions are deployed.
5. Confirm production environment variables.
6. Run a clean dependency install.
7. Run the production build.
8. Review build output for errors.
9. Deploy the approved build.
10. Open https://vattams.net.
11. Test Student login.
12. Test Tutor login.
13. Test Admin login.
14. Test one critical course/classroom flow.
15. Test notification delivery.
16. Test certificate/QR verification.
17. Test payment/UTR flow where applicable.
18. Test on Wi-Fi and mobile data.
19. Check browser console and server logs.
20. Keep rollback/recovery procedure ready.

## GO / NO-GO
NO-GO if any of these fail:
- Authentication
- Authorization/RLS
- Student/tutor historical data integrity
- Payment/UTR approval
- Classroom/assignment/test submission
- Certificate verification
- Critical Edge Function
- Backup/recovery
- Production build

Phase 41 does not deploy production automatically.
