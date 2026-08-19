# VATTAMS Academy Phase 35 — Security & Production Readiness

## Added
- Security event audit table
- Login attempt audit foundation
- Server-side Academy session validation
- Expired session cleanup
- Admin security summary
- Student/Tutor/Admin session utility
- Security event API foundation

## Login reliability
The Academy session layer validates the active session against the server rather than trusting only browser state. This is intended to make Student, Tutor and Admin login/session handling reliable across different networks.

Existing login functions are not replaced automatically in this phase. They should call the session validation utility after successful login and before protected operations.

## Security principles
- No passwords are stored by the new Phase 35 code.
- Existing authentication remains the source of truth.
- Existing Tuition records are preserved.
- Direct client access to security tables remains disabled with RLS.
- No destructive migrations.
- No Home Services database deletion.
- No payment schema changes.

## Production checklist
Before production:
1. Verify all three login flows against the real Supabase environment.
2. Verify session expiry and logout.
3. Verify RLS policies in Supabase.
4. Deploy Edge Functions through the project's normal deployment process.
5. Run the production build with network-enabled dependencies.
6. Test on mobile data and Wi-Fi separately.
