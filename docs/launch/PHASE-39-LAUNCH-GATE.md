# VATTAMS Academy Phase 39 — Performance, Accessibility & Launch Gate

## Automated checks
- Client performance timing
- First Contentful Paint when available
- DOMContentLoaded timing
- Page-load timing
- Connection type
- Online/offline state
- Root application existence
- Image alt-attribute smoke check
- Accessible button-name smoke check
- Accessible link-name smoke check
- Input-label smoke check
- HTML language declaration

## Performance targets
These are practical smoke-test thresholds, not a guarantee of a specific Lighthouse score:
- FCP target: under 3 seconds where measurable
- DOMContentLoaded target: under 5 seconds where measurable

Real-device testing is still required.

## Accessibility
The automated checks are intentionally lightweight. Final testing should include:
- Keyboard navigation
- Screen-reader testing
- Focus visibility
- Color contrast
- Touch target size
- Zoom/reflow
- Form error messaging
- Reduced-motion behavior

## Production launch gate
Before launch:
1. Build must pass in a network-enabled environment.
2. Student/Tutor/Admin login must pass on Wi-Fi and mobile data.
3. RLS and role authorization must be verified.
4. Payment/UTR workflows must be tested.
5. Certificate QR verification must be tested.
6. PWA installation must be tested on supported Android browsers.
7. Supabase Edge Functions must be deployed and tested.
8. Managed backup availability must be confirmed.
9. No critical console/runtime errors should remain.
10. Real-device smoke test must pass.

## Important
Phase 39 does not automatically declare production readiness. It provides a final automated gate and a checklist for the real release test.
