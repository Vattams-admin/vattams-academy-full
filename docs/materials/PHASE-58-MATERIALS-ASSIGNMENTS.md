# VATTAMS Academy Phase 58 — Materials & Assignments

## Purpose
Build the learning-content and assignment workflow foundation.

## Materials
Supported material types:
- PDF
- Document
- Video
- Audio
- Link
- Image

Materials are associated with:
Course → Module → Lesson → Material

## Assignments
Assignment lifecycle:
Draft → Published → Closed

Each assignment supports:
- Instructions
- Due date
- Maximum marks
- Student submission status
- Grading/feedback foundation

## Production requirements
1. Students can access only materials for courses they are authorized to access.
2. Tutors can manage only their assigned course content.
3. File storage must use authenticated access.
4. File uploads require size/type validation.
5. Assignment submissions must be immutable or versioned after submission.
6. Due dates must be enforced server-side.
7. Grading must be server-authorized.
8. RLS must prevent cross-student access.

## Data safety
No automatic Supabase storage bucket/table creation was performed.
Existing Tuition data remains untouched.
