# VATTAMS Academy Phase 59 — Tutor Assignment & Grading Workflow

## Purpose
Create the tutor-side assignment review and grading foundation.

## Workflow
Student submits → Tutor reviews → Tutor awards marks → Tutor feedback → Graded/Returned

## Added
- Submission review model
- Pending grading count
- Marks validation
- Percentage calculation
- Tutor grading UI
- Feedback UI
- Graded state
- Production authorization guidance

## Production security
1. Only the assigned tutor or authorized admin may grade a submission.
2. Marks must be validated server-side.
3. Tutor ownership must be server-side/RLS enforced.
4. Students can only read their own submissions and feedback.
5. Grade history should be auditable.
6. Existing historical submissions must not be overwritten destructively.
7. Final results should consume server-validated grades.

## Data safety
No automatic Supabase schema changes were performed.
Existing Tuition and historical data remain preserved.
