# VATTAMS Academy Phase 57 — Course Catalogue

## Purpose
Create the public/student-facing online course discovery experience.

## Catalogue capabilities
- Course search
- Category filtering
- Level filtering
- Featured courses
- Course detail preview
- Online-only learning presentation

## Academy categories supported
- Academic
- Foundation
- Communication
- Technology
- Competitive Exams
- International

## Data safety
This phase provides the catalogue UI and filtering utilities. Production course data must come from the authorized backend.

Do not:
- delete existing course records
- overwrite historical tuition selections
- bypass existing enrollment/payment rules
- expose inactive/private courses to students

## Important naming rule
The public/display name is "Public Speaking". Historical database values such as "Spoken English" must not be changed merely for display naming.
