export type AcademyMaterialType =
  | 'pdf'
  | 'document'
  | 'video'
  | 'audio'
  | 'link'
  | 'image';

export type AcademyMaterial = {
  id: string;
  courseId: string;
  moduleId: string;
  lessonId: string;
  title: string;
  description?: string;
  type: AcademyMaterialType;
  resourceUrl: string;
  downloadable: boolean;
  published: boolean;
};

export type AcademyAssignmentStatus =
  | 'draft'
  | 'published'
  | 'closed';

export type AcademyAssignment = {
  id: string;
  courseId: string;
  moduleId: string;
  lessonId: string;
  title: string;
  instructions: string;
  dueAt?: string;
  maxMarks: number;
  status: AcademyAssignmentStatus;
};

export type AssignmentSubmissionStatus =
  | 'not_started'
  | 'submitted'
  | 'graded'
  | 'returned';

export type AcademyAssignmentSubmission = {
  assignmentId: string;
  studentId: string;
  submittedAt?: string;
  status: AssignmentSubmissionStatus;
  marks?: number;
  feedback?: string;
};

export function filterPublishedMaterials(
  materials: AcademyMaterial[],
  courseId?: string,
) {
  return materials.filter(
    (material) =>
      material.published &&
      (!courseId || material.courseId === courseId),
  );
}

export function filterPublishedAssignments(
  assignments: AcademyAssignment[],
  courseId?: string,
) {
  return assignments.filter(
    (assignment) =>
      assignment.status === 'published' &&
      (!courseId || assignment.courseId === courseId),
  );
}

export function canSubmitAssignment(
  assignment: AcademyAssignment,
  now = Date.now(),
) {
  if (assignment.status !== 'published') return false;
  if (!assignment.dueAt) return true;
  return new Date(assignment.dueAt).getTime() >= now;
}

export function calculateAssignmentPercentage(
  marks: number | undefined,
  maxMarks: number,
) {
  if (marks === undefined || maxMarks <= 0) return 0;
  return Math.max(0, Math.min(100, (marks / maxMarks) * 100));
}
