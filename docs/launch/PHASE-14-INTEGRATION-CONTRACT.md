# Phase 14 Integration Contract

The project is now treated as **VATTAMS Academy**, an online education product.

## Preserve

- tuition_students
- tuition_tutors
- historical Tuition selections
- tutor registration/payment/UTR/approval logic
- employee/student ID assignment
- existing RLS unless a required change is reviewed first
- existing Tuition course/material/class/attendance functionality

## Do not do

- Do not rebuild the project from scratch
- Do not migrate away from Supabase during launch hardening
- Do not delete Home Services database tables as part of this phase
- Do not silently change auth/session logic
- Do not expose service-role credentials to the browser
- Do not claim certificates are externally accredited

## Shared integration

The following reusable modules are available for the existing dashboards:

- `VattamsAcademyRoleIntegration`
- `TuitionNotificationCenter`
- `VattamsAcademyLaunchReadiness`

They should be inserted into the existing Student/Tutor/Admin shells using the project's current router and auth conventions.

## Network requirement

All login paths must be verified from:

- home Wi-Fi
- mobile data
- a second Wi-Fi

A page loading is not sufficient. Login, authenticated API calls, dashboard data, logout and re-login must all work.

## Release principle

Phase 14 is a hardening and verification phase, not a permission to make destructive cleanup. Any Home Services database deletion is a separate, explicitly approved operation after a verified backup.
