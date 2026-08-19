export type AssessmentPlayerQuestion = {
  id: string;
  prompt: string;
  type: 'single_choice' | 'multiple_choice' | 'true_false' | 'short_answer';
  options?: string[];
  marks: number;
  required: boolean;
  order: number;
};

export type AssessmentPlayerState = {
  currentIndex: number;
  answers: Record<string, string[]>;
  startedAt: string;
  submitted: boolean;
};

export function createInitialAssessmentPlayerState(
  questions: AssessmentPlayerQuestion[],
): AssessmentPlayerState {
  return {
    currentIndex: 0,
    answers: Object.fromEntries(questions.map((question) => [question.id, []])),
    startedAt: new Date().toISOString(),
    submitted: false,
  };
}

export function updateAssessmentAnswer(
  answers: Record<string, string[]>,
  questionId: string,
  values: string[],
) {
  return {
    ...answers,
    [questionId]: values,
  };
}

export function getAnsweredCount(
  questions: AssessmentPlayerQuestion[],
  answers: Record<string, string[]>,
) {
  return questions.filter((question) => (answers[question.id] || []).length > 0).length;
}

export function getRemainingSeconds(
  startedAt: string,
  durationMinutes: number,
  now = Date.now(),
) {
  const started = new Date(startedAt).getTime();
  const total = Math.max(0, durationMinutes) * 60;
  const elapsed = Math.max(0, Math.floor((now - started) / 1000));
  return Math.max(0, total - elapsed);
}
