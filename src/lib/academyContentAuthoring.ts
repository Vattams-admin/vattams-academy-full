export type ContentStatus = 'draft' | 'review' | 'published' | 'archived';

export type ContentType =
  | 'lesson'
  | 'material'
  | 'assignment'
  | 'test'
  | 'competition';

export type AcademyContentDraft = {
  id: string;
  title: string;
  type: ContentType;
  courseId: string;
  description: string;
  status: ContentStatus;
  order: number;
  version: number;
};

export type ContentValidationIssue = {
  severity: 'error' | 'warning';
  field?: string;
  message: string;
};

export function validateContentDraft(
  draft: AcademyContentDraft,
): ContentValidationIssue[] {
  const issues: ContentValidationIssue[] = [];

  if (!draft.id.trim()) {
    issues.push({ severity: 'error', field: 'id', message: 'Content ID is required.' });
  }

  if (!draft.title.trim()) {
    issues.push({ severity: 'error', field: 'title', message: 'Title is required.' });
  }

  if (!draft.courseId.trim()) {
    issues.push({ severity: 'error', field: 'courseId', message: 'Course ID is required.' });
  }

  if (!draft.description.trim()) {
    issues.push({
      severity: 'warning',
      field: 'description',
      message: 'Description is empty.',
    });
  }

  if (draft.order < 0) {
    issues.push({
      severity: 'error',
      field: 'order',
      message: 'Order cannot be negative.',
    });
  }

  if (draft.version < 1) {
    issues.push({
      severity: 'error',
      field: 'version',
      message: 'Version must be at least 1.',
    });
  }

  return issues;
}

export function canPublishContent(draft: AcademyContentDraft) {
  const issues = validateContentDraft(draft);
  return !issues.some((issue) => issue.severity === 'error');
}

export function nextContentVersion(currentVersion: number) {
  return Math.max(1, currentVersion) + 1;
}
