import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Send,
  ShieldCheck,
} from 'lucide-react';
import {
  createInitialAssessmentPlayerState,
  getAnsweredCount,
  getRemainingSeconds,
  updateAssessmentAnswer,
  type AssessmentPlayerQuestion,
} from '@/lib/academyAssessmentPlayer';

const DEMO_QUESTIONS: AssessmentPlayerQuestion[] = [
  {
    id: 'demo-q1',
    prompt: 'Which number is greater than 10?',
    type: 'single_choice',
    options: ['7', '9', '12', '5'],
    marks: 1,
    required: true,
    order: 1,
  },
  {
    id: 'demo-q2',
    prompt: 'Select the prime numbers.',
    type: 'multiple_choice',
    options: ['2', '4', '5', '8'],
    marks: 2,
    required: false,
    order: 2,
  },
  {
    id: 'demo-q3',
    prompt: 'The Earth is a planet.',
    type: 'true_false',
    options: ['True', 'False'],
    marks: 1,
    required: true,
    order: 3,
  },
];

export default function AcademyAssessmentPlayer({
  questions = DEMO_QUESTIONS,
  durationMinutes = 30,
  title = 'Assessment Preview',
}: {
  questions?: AssessmentPlayerQuestion[];
  durationMinutes?: number;
  title?: string;
}) {
  const [state, setState] = useState(() =>
    createInitialAssessmentPlayerState(questions),
  );
  const [now, setNow] = useState(Date.now());
  const [showSubmitWarning, setShowSubmitWarning] = useState(false);

  const current = questions[state.currentIndex];
  const remaining = getRemainingSeconds(state.startedAt, durationMinutes, now);
  const answered = getAnsweredCount(questions, state.answers);
  const timeExpired = remaining <= 0;

  useEffect(() => {
    if (state.submitted) return;

    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [state.submitted]);

  useEffect(() => {
    if (timeExpired && !state.submitted) {
      setState((currentState) => ({ ...currentState, submitted: true }));
    }
  }, [timeExpired, state.submitted]);

  const formattedTime = useMemo(() => {
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }, [remaining]);

  const selectAnswer = (value: string) => {
    if (!current || state.submitted) return;

    const existing = state.answers[current.id] || [];

    let next: string[];

    if (current.type === 'multiple_choice') {
      next = existing.includes(value)
        ? existing.filter((item) => item !== value)
        : [...existing, value];
    } else {
      next = [value];
    }

    setState((currentState) => ({
      ...currentState,
      answers: updateAssessmentAnswer(
        currentState.answers,
        current.id,
        next,
      ),
    }));
  };

  const goPrevious = () => {
    setState((currentState) => ({
      ...currentState,
      currentIndex: Math.max(0, currentState.currentIndex - 1),
    }));
  };

  const goNext = () => {
    setState((currentState) => ({
      ...currentState,
      currentIndex: Math.min(
        questions.length - 1,
        currentState.currentIndex + 1,
      ),
    }));
  };

  const submit = () => {
    setState((currentState) => ({
      ...currentState,
      submitted: true,
    }));
    setShowSubmitWarning(false);
  };

  if (state.submitted) {
    return (
      <section className="bg-white border rounded-3xl p-6 text-center">
        <div className="mx-auto w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <CheckCircle2 size={28} />
        </div>
        <h2 className="text-2xl font-black mt-4">
          Assessment submitted
        </h2>
        <p className="text-sm text-slate-500 mt-2">
          Your response has been prepared for the submission workflow.
        </p>
        <p className="text-xs text-slate-400 mt-4">
          Answered: {answered} / {questions.length}
        </p>
      </section>
    );
  }

  if (!current) {
    return (
      <section className="bg-white border rounded-3xl p-6">
        <p className="font-black">No assessment questions available.</p>
      </section>
    );
  }

  const selected = state.answers[current.id] || [];

  return (
    <section className="space-y-4">
      <div className="bg-white border rounded-3xl p-5">
        <div className="flex flex-wrap justify-between items-center gap-3">
          <div>
            <p className="text-xs font-black uppercase text-indigo-600">
              Student Assessment
            </p>
            <h2 className="text-2xl font-black mt-1">{title}</h2>
          </div>

          <div
            className={`rounded-2xl px-4 py-3 font-black flex items-center gap-2 ${
              remaining <= 60
                ? 'bg-rose-50 text-rose-700'
                : 'bg-indigo-50 text-indigo-700'
            }`}
            aria-live="polite"
          >
            <Clock3 size={18} />
            {formattedTime}
          </div>
        </div>

        <div className="mt-4 h-2 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full bg-indigo-600 transition-all"
            style={{
              width: `${questions.length ? ((state.currentIndex + 1) / questions.length) * 100 : 0}%`,
            }}
          />
        </div>

        <div className="flex justify-between text-xs text-slate-500 mt-2">
          <span>Question {state.currentIndex + 1} of {questions.length}</span>
          <span>{answered} answered</span>
        </div>
      </div>

      <div className="bg-white border rounded-3xl p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck className="text-indigo-600 shrink-0" />
          <div>
            <p className="font-black">Question {state.currentIndex + 1}</p>
            <p className="text-lg font-bold mt-2">{current.prompt}</p>
            <p className="text-xs text-slate-400 mt-2">
              {current.marks} mark{current.marks === 1 ? '' : 's'}
              {current.required ? ' · Required' : ' · Optional'}
            </p>
          </div>
        </div>

        {current.type === 'short_answer' ? (
          <input
            value={selected[0] || ''}
            onChange={(e) => selectAnswer(e.target.value)}
            className="mt-5 w-full rounded-xl border px-3 py-3"
            placeholder="Type your answer"
          />
        ) : (
          <div className="space-y-3 mt-5">
            {(current.options || []).map((option) => {
              const checked = selected.includes(option);

              return (
                <label
                  key={option}
                  className={`flex items-center gap-3 rounded-2xl border p-4 cursor-pointer ${
                    checked ? 'border-indigo-500 bg-indigo-50' : 'bg-white'
                  }`}
                >
                  <input
                    type={current.type === 'multiple_choice' ? 'checkbox' : 'radio'}
                    name={current.id}
                    checked={checked}
                    onChange={() => selectAnswer(option)}
                    className="w-4 h-4"
                  />
                  <span className="font-bold text-sm">{option}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {showSubmitWarning && (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5">
          <div className="flex gap-3">
            <AlertTriangle className="text-amber-600 shrink-0" />
            <div>
              <p className="font-black">Submit assessment?</p>
              <p className="text-sm text-amber-900 mt-1">
                You have answered {answered} of {questions.length} questions.
                Unanswered questions may receive no marks.
              </p>
              <div className="flex gap-2 mt-4">
                <button
                  type="button"
                  onClick={submit}
                  className="rounded-xl bg-emerald-600 text-white px-4 py-2 font-black"
                >
                  Confirm Submit
                </button>
                <button
                  type="button"
                  onClick={() => setShowSubmitWarning(false)}
                  className="rounded-xl border px-4 py-2 font-black"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border rounded-3xl p-4 flex flex-wrap justify-between gap-3">
        <button
          type="button"
          onClick={goPrevious}
          disabled={state.currentIndex === 0}
          className="rounded-xl border px-4 py-3 font-black inline-flex items-center gap-2 disabled:opacity-40"
        >
          <ChevronLeft size={17} /> Previous
        </button>

        {state.currentIndex < questions.length - 1 ? (
          <button
            type="button"
            onClick={goNext}
            className="rounded-xl bg-indigo-600 text-white px-4 py-3 font-black inline-flex items-center gap-2"
          >
            Next <ChevronRight size={17} />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setShowSubmitWarning(true)}
            className="rounded-xl bg-emerald-600 text-white px-4 py-3 font-black inline-flex items-center gap-2"
          >
            <Send size={17} /> Submit
          </button>
        )}
      </div>
    </section>
  );
}
