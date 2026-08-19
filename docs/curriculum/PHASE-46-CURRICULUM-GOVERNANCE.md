# VATTAMS Academy Phase 46 — Curriculum & Content Governance

## Purpose
Prepare the Academy for a large, scalable course catalogue without guessing or changing the existing database schema.

## Supported learning hierarchy
Category → Course → Level → Module → Lesson → Material → Assignment → Test → Certificate

## Governance rules
1. Every item needs a stable unique ID.
2. Every item needs a clear title.
3. Non-category items should have a valid parent.
4. An item cannot be its own parent.
5. Ordering should be deterministic.
6. Draft content should not be presented as published content.
7. Historical course data must not be overwritten destructively.
8. Existing `tuition_courses` data remains the source of truth until the actual schema is reviewed.

## Course expansion
The product roadmap can support:
- Academic
- Foundation
- Communication
- Technology
- Competitive Exams
- International
- Competitions

Examples include Mathematics, Science, Physics, Chemistry, Biology, English, Tamil, Hindi, Computer Science, Coding, Python, AI Fundamentals, Generative AI, TNPSC, SSC, Banking, Railway, TET, TRB, JEE Foundation, NEET Foundation, IELTS, TOEFL, PTE, SAT and other approved offerings.

## Important
Phase 46 does not insert these courses into Supabase automatically. Course creation should happen only after the exact existing `tuition_courses` schema and admin workflow are verified.
