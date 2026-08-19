import { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Clock3,
  FileQuestion,
  Plus,
  Save,
  ShieldCheck,
  Trash2,
  TriangleAlert,
} from 'lucide-react';
import {
  validateAssessment,
  type AssessmentDefinition,
  type AssessmentQuestion,
  type AssessmentQuestionType,
} from '@/lib/academyAssessment';

const initialAssessment: AssessmentDefinition = {
  id: `assessment-${Date.now()}`,
  title: '',
  courseId: '',
  durationMinutes: 30,
  passPercentage: 40,
  attemptsAllowed: 1,
  status: 'draft',
  questions: [],
};

export default function AcademyAssessmentStudio() {
  const [assessment, setAssessment] = useState<AssessmentDefinition>(initialAssessment);
  const validation = useMemo(() => validateAssessment(assessment), [assessment]);

  const addQuestion = () => {
    setAssessment((current) => ({
      ...current,
      questions: [
        ...current.questions,
        {
          id: `q-${Date.now()}`,
          prompt: '',
          type: 'single_choice',
          options: ['', '', '', ''],
          correctOptionIndexes: [],
          marks: 1,
          negativeMarks: 0,
          required: true,
          order: current.questions.length + 1,
        },
      ],
    }));
  };

  const updateQuestion = (
    id: string,
    patch: Partial<AssessmentQuestion>,
  ) => {
    setAssessment((current) => ({
      ...current,
      questions: current.questions.map((question) =>
        question.id === id ? { ...question, ...patch } : question,
      ),
    }));
  };

  const removeQuestion = (id: string) => {
    setAssessment((current) => ({
      ...current,
      questions: current.questions.filter((question) => question.id !== id),
    }));
  };

  return (
    <section className="space-y-5">
      <div className="bg-white border rounded-3xl p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-indigo-50 text-indigo-600 p-3">
              <FileQuestion size={22} />
            </div>
            <div>
              <p className="text-xs font-black uppercase text-indigo-600">
                Assessment Studio
              </p>
              <h2 className="text-2xl font-black mt-1">
                Tests & Assessments
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Build controlled assessments without changing the existing Tuition database.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={addQuestion}
            className="rounded-xl bg-indigo-600 text-white px-4 py-2 font-black inline-flex items-center gap-2"
          >
            <Plus size={16} /> Add Question
          </button>
        </div>
      </div>

      <div className="bg-white border rounded-3xl p-5">
        <h3 className="font-black">Assessment Settings</h3>

        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <Field
            label="Assessment title"
            value={assessment.title}
            onChange={(value) => setAssessment((c) => ({ ...c, title: value }))}
            placeholder="Example: Mathematics Level 1 Test"
          />
          <Field
            label="Existing Course ID"
            value={assessment.courseId}
            onChange={(value) => setAssessment((c) => ({ ...c, courseId: value }))}
            placeholder="Existing course ID"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          <NumberField
            label="Duration (minutes)"
            value={assessment.durationMinutes}
            onChange={(value) => setAssessment((c) => ({ ...c, durationMinutes: value }))}
          />
          <NumberField
            label="Pass percentage"
            value={assessment.passPercentage}
            onChange={(value) => setAssessment((c) => ({ ...c, passPercentage: value }))}
          />
          <NumberField
            label="Attempts allowed"
            value={assessment.attemptsAllowed}
            onChange={(value) => setAssessment((c) => ({ ...c, attemptsAllowed: value }))}
          />
        </div>
      </div>

      <div className="space-y-4">
        {assessment.questions.map((question, index) => (
          <QuestionCard
            key={question.id}
            question={question}
            index={index}
            onChange={(patch) => updateQuestion(question.id, patch)}
            onRemove={() => removeQuestion(question.id)}
          />
        ))}

        {assessment.questions.length === 0 && (
          <div className="bg-slate-50 border border-dashed rounded-3xl p-8 text-center">
            <FileQuestion className="mx-auto text-slate-400" />
            <p className="font-black mt-3">No questions yet</p>
            <p className="text-sm text-slate-500 mt-1">
              Add questions to create the assessment.
            </p>
          </div>
        )}
      </div>

      <div className={`rounded-3xl border p-5 ${
        validation.valid
          ? 'bg-emerald-50 border-emerald-200'
          : 'bg-amber-50 border-amber-200'
      }`}>
        <div className="flex gap-3">
          {validation.valid
            ? <CheckCircle2 className="text-emerald-600 shrink-0" />
            : <TriangleAlert className="text-amber-600 shrink-0" />}
          <div className="flex-1">
            <p className="font-black">
              {validation.valid ? 'Assessment is valid' : 'Assessment needs review'}
            </p>

            {!validation.valid && (
              <ul className="text-sm mt-2 list-disc pl-5 space-y-1">
                {validation.issues.map((issue, index) => (
                  <li key={index}>{issue}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white border rounded-3xl p-5 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={!validation.valid}
          onClick={() => setAssessment((current) => ({ ...current, status: 'review' }))}
          className="rounded-xl border px-4 py-3 font-black inline-flex items-center gap-2 disabled:opacity-40"
        >
          <Save size={16} /> Save for Review
        </button>

        <div className="rounded-xl bg-indigo-50 text-indigo-800 px-4 py-3 text-sm font-bold inline-flex items-center gap-2">
          <ShieldCheck size={16} /> Status: {assessment.status}
        </div>
      </div>
    </section>
  );
}

function QuestionCard({
  question,
  index,
  onChange,
  onRemove,
}: {
  question: AssessmentQuestion;
  index: number;
  onChange: (patch: Partial<AssessmentQuestion>) => void;
  onRemove: () => void;
}) {
  const options = question.options || [];

  return (
    <div className="bg-white border rounded-3xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase text-indigo-600">
            Question {index + 1}
          </p>
          <p className="text-xs text-slate-400 mt-1">{question.id}</p>
        </div>

        <button
          type="button"
          onClick={onRemove}
          className="rounded-xl border p-2 text-rose-600"
          aria-label={`Delete question ${index + 1}`}
          title={`Delete question ${index + 1}`}
        >
          <Trash2 size={17} />
        </button>
      </div>

      <textarea
        value={question.prompt}
        onChange={(e) => onChange({ prompt: e.target.value })}
        rows={3}
        className="mt-4 w-full rounded-xl border px-3 py-3"
        placeholder="Enter the question..."
      />

      <div className="grid md:grid-cols-3 gap-3 mt-4">
        <label className="block">
          <span className="text-xs font-black text-slate-600">Type</span>
          <select
            value={question.type}
            onChange={(e) =>
              onChange({ type: e.target.value as AssessmentQuestionType })
            }
            className="mt-2 w-full rounded-xl border px-3 py-3 bg-white"
          >
            <option value="single_choice">Single choice</option>
            <option value="multiple_choice">Multiple choice</option>
            <option value="true_false">True / False</option>
            <option value="short_answer">Short answer</option>
          </select>
        </label>

        <NumberField
          label="Marks"
          value={question.marks}
          onChange={(value) => onChange({ marks: value })}
        />

        <NumberField
          label="Negative marks"
          value={question.negativeMarks}
          onChange={(value) => onChange({ negativeMarks: value })}
        />
      </div>

      {(question.type === 'single_choice' || question.type === 'multiple_choice') && (
        <div className="mt-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-600">Options</span>
            <Clock3 size={14} className="text-slate-400" />
          </div>

          <div className="grid md:grid-cols-2 gap-3 mt-2">
            {options.map((option, optionIndex) => (
              <input
                key={optionIndex}
                value={option}
                onChange={(e) => {
                  const next = [...options];
                  next[optionIndex] = e.target.value;
                  onChange({ options: next });
                }}
                className="rounded-xl border px-3 py-3"
                placeholder={`Option ${optionIndex + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-black text-slate-600">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-xl border px-3 py-3"
        placeholder={placeholder}
      />
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-black text-slate-600">{label}</span>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full rounded-xl border px-3 py-3"
      />
    </label>
  );
}
