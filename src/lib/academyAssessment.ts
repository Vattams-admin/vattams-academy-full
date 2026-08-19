export type AssessmentQuestionType =
  | 'single_choice'
  | 'multiple_choice'
  | 'true_false'
  | 'short_answer';

export type AssessmentQuestion = {
  id: string;
  prompt: string;
  type: AssessmentQuestionType;
  options?: string[];
  correctOptionIndexes?: number[];
  correctAnswer?: string;
  marks: number;
  negativeMarks: number;
  required: boolean;
  order: number;
};

export type AssessmentDefinition = {
  id: string;
  title: string;
  courseId: string;
  durationMinutes: number;
  passPercentage: number;
  attemptsAllowed: number;
  status: 'draft' | 'review' | 'published' | 'archived';
  questions: AssessmentQuestion[];
};

export function validateAssessment(assessment: AssessmentDefinition) {
  const issues: string[] = [];

  if (!assessment.id.trim()) issues.push('Assessment ID is required.');
  if (!assessment.title.trim()) issues.push('Assessment title is required.');
  if (!assessment.courseId.trim()) issues.push('Course ID is required.');

  if (assessment.durationMinutes <= 0) {
    issues.push('Duration must be greater than zero.');
  }

  if (assessment.passPercentage < 0 || assessment.passPercentage > 100) {
    issues.push('Pass percentage must be between 0 and 100.');
  }

  if (assessment.attemptsAllowed <= 0) {
    issues.push('Attempts allowed must be greater than zero.');
  }

  if (assessment.questions.length === 0) {
    issues.push('At least one question is required.');
  }

  const ids = new Set<string>();

  for (const question of assessment.questions) {
    if (!question.id.trim()) issues.push('Every question needs an ID.');
    if (ids.has(question.id)) issues.push(`Duplicate question ID: ${question.id}`);
    ids.add(question.id);

    if (!question.prompt.trim()) {
      issues.push(`Question ${question.id || '(unknown)'} needs a prompt.`);
    }

    if (question.marks <= 0) {
      issues.push(`Question ${question.id || '(unknown)'} must have positive marks.`);
    }

    if (question.negativeMarks < 0) {
      issues.push(`Question ${question.id || '(unknown)'} cannot have negative negative-marks.`);
    }

    if (
      (question.type === 'single_choice' || question.type === 'multiple_choice') &&
      (!question.options || question.options.length < 2)
    ) {
      issues.push(`Question ${question.id || '(unknown)'} needs at least two options.`);
    }
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

export function calculateAssessmentScore(
  questions: AssessmentQuestion[],
  answers: Record<string, string[]>,
) {
  let earned = 0;
  let maximum = 0;

  for (const question of questions) {
    maximum += Math.max(0, question.marks);

    const supplied = answers[question.id] || [];
    const expected = question.correctOptionIndexes?.map(String) || [];

    if (question.type === 'short_answer') {
      if (
        question.correctAnswer &&
        supplied[0]?.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase()
      ) {
        earned += question.marks;
      } else if (supplied.length > 0) {
        earned -= question.negativeMarks;
      }
      continue;
    }

    const actual = [...supplied].sort();
    const correct = [...expected].sort();

    if (JSON.stringify(actual) === JSON.stringify(correct)) {
      earned += question.marks;
    } else if (supplied.length > 0) {
      earned -= question.negativeMarks;
    }
  }

  const percentage = maximum > 0
    ? Math.max(0, Math.min(100, (earned / maximum) * 100))
    : 0;

  return {
    earnedMarks: Math.max(0, earned),
    maximumMarks: maximum,
    percentage,
  };
}
