export type CurriculumStage =
  | 'category'
  | 'course'
  | 'level'
  | 'module'
  | 'lesson'
  | 'material'
  | 'assignment'
  | 'test'
  | 'certificate';

export type CurriculumItem = {
  id: string;
  title: string;
  stage: CurriculumStage;
  parentId?: string;
  active: boolean;
  order: number;
};

export type CurriculumValidationIssue = {
  severity: 'error' | 'warning';
  itemId?: string;
  message: string;
};

export function validateCurriculum(items: CurriculumItem[]) {
  const issues: CurriculumValidationIssue[] = [];
  const ids = new Set<string>();

  for (const item of items) {
    if (!item.id.trim()) {
      issues.push({ severity: 'error', message: 'Curriculum item has no ID.' });
      continue;
    }

    if (ids.has(item.id)) {
      issues.push({
        severity: 'error',
        itemId: item.id,
        message: 'Duplicate curriculum ID.',
      });
    }

    ids.add(item.id);

    if (!item.title.trim()) {
      issues.push({
        severity: 'error',
        itemId: item.id,
        message: 'Curriculum item has no title.',
      });
    }

    if (item.order < 0) {
      issues.push({
        severity: 'warning',
        itemId: item.id,
        message: 'Order should not be negative.',
      });
    }

    if (item.stage !== 'category' && !item.parentId) {
      issues.push({
        severity: 'warning',
        itemId: item.id,
        message: 'Non-category item has no parentId.',
      });
    }
  }

  for (const item of items) {
    if (item.parentId && !ids.has(item.parentId)) {
      issues.push({
        severity: 'error',
        itemId: item.id,
        message: `Parent "${item.parentId}" does not exist.`,
      });
    }

    if (item.parentId === item.id) {
      issues.push({
        severity: 'error',
        itemId: item.id,
        message: 'Item cannot be its own parent.',
      });
    }
  }

  return {
    valid: !issues.some((issue) => issue.severity === 'error'),
    issues,
    totalItems: items.length,
  };
}

export function groupCurriculumByStage(items: CurriculumItem[]) {
  return items.reduce<Record<CurriculumStage, CurriculumItem[]>>(
    (groups, item) => {
      groups[item.stage].push(item);
      return groups;
    },
    {
      category: [],
      course: [],
      level: [],
      module: [],
      lesson: [],
      material: [],
      assignment: [],
      test: [],
      certificate: [],
    },
  );
}
