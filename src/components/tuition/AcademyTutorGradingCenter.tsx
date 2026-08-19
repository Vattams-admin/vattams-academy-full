import { useMemo, useState } from 'react';
import {
  CheckCircle2,
  ClipboardCheck,
  MessageSquareText,
  Save,
  Search,
  ShieldCheck,
  Star,
  UserRound,
} from 'lucide-react';
import {
  calculatePercentage,
  getPendingGradingCount,
  gradeSubmission,
  type GradingSubmission,
} from '@/lib/academyTutorGrading';

const DEMO_SUBMISSIONS: GradingSubmission[] = [
  {
    id: 'submission-1',
    assignmentId: 'assignment-1',
    studentId: 'student-1',
    studentName: 'Student One',
    submittedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    status: 'submitted',
    maxMarks: 20,
  },
  {
    id: 'submission-2',
    assignmentId: 'assignment-2',
    studentId: 'student-2',
    studentName: 'Student Two',
    submittedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    status: 'under_review',
    maxMarks: 25,
  },
  {
    id: 'submission-3',
    assignmentId: 'assignment-1',
    studentId: 'student-3',
    studentName: 'Student Three',
    submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'graded',
    marks: 18,
    maxMarks: 20,
    feedback: 'Good work. Review the final two questions once more.',
    gradedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    gradedBy: 'tutor-demo',
  },
];

export default function AcademyTutorGradingCenter({
  initialSubmissions = DEMO_SUBMISSIONS,
}: {
  initialSubmissions?: GradingSubmission[];
}) {
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [selectedId, setSelectedId] = useState(initialSubmissions[0]?.id || '');
  const [search, setSearch] = useState('');
  const [marks, setMarks] = useState('');
  const [feedback, setFeedback] = useState('');
  const [message, setMessage] = useState('');

  const selected = submissions.find((item) => item.id === selectedId);

  const filtered = useMemo(
    () =>
      submissions.filter((submission) =>
        `${submission.studentName} ${submission.assignmentId}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [submissions, search],
  );

  const pendingCount = getPendingGradingCount(submissions);

  const selectSubmission = (submission: GradingSubmission) => {
    setSelectedId(submission.id);
    setMarks(submission.marks !== undefined ? String(submission.marks) : '');
    setFeedback(submission.feedback || '');
    setMessage('');
  };

  const saveGrade = () => {
    if (!selected) return;

    const numericMarks = Number(marks);

    try {
      const updated = gradeSubmission(
        selected,
        numericMarks,
        feedback,
        'tutor-demo',
      );

      setSubmissions((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
      setMarks(String(numericMarks));
      setMessage('Grade saved successfully.');
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Unable to save the grade.',
      );
    }
  };

  return (
    <section className="space-y-5">
      <div className="bg-white border rounded-3xl p-5">
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-indigo-50 text-indigo-600 p-3">
              <ClipboardCheck size={22} />
            </div>
            <div>
              <p className="text-xs font-black uppercase text-indigo-600">
                Tutor Portal
              </p>
              <h2 className="text-2xl font-black mt-1">
                Assignment Grading Center
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Review submissions, award marks and provide student feedback.
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-amber-50 text-amber-700 px-4 py-2 text-sm font-black">
            {pendingCount} pending review
          </div>
        </div>

        <div className="relative mt-5">
          <Search size={18} className="absolute left-3 top-3.5 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border pl-10 pr-3 py-3"
            placeholder="Search student or assignment..."
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-[0.9fr_1.4fr] gap-5">
        <div className="bg-white border rounded-3xl p-4">
          <p className="text-xs font-black uppercase text-slate-500 px-2">
            Submissions
          </p>

          <div className="space-y-2 mt-3">
            {filtered.map((submission) => {
              const active = submission.id === selectedId;
              const percentage =
                submission.marks !== undefined
                  ? calculatePercentage(
                      submission.marks,
                      submission.maxMarks,
                    )
                  : null;

              return (
                <button
                  key={submission.id}
                  type="button"
                  onClick={() => selectSubmission(submission)}
                  className={`w-full text-left rounded-2xl p-4 border ${
                    active
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between gap-3">
                    <div>
                      <p className="font-black text-sm">
                        {submission.studentName}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {submission.assignmentId}
                      </p>
                    </div>
                    <span className="text-xs font-black">
                      {percentage !== null
                        ? `${Math.round(percentage)}%`
                        : submission.status}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white border rounded-3xl p-5">
          {selected ? (
            <>
              <div className="flex flex-wrap justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <UserRound className="text-indigo-600" size={20} />
                  </div>
                  <div>
                    <p className="font-black">{selected.studentName}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Assignment: {selected.assignmentId}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Submitted:{' '}
                      {new Date(selected.submittedAt).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                {selected.marks !== undefined && (
                  <div className="rounded-2xl bg-emerald-50 text-emerald-700 px-4 py-3">
                    <p className="text-xs font-bold">Current score</p>
                    <p className="text-xl font-black">
                      {selected.marks}/{selected.maxMarks}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6">
                <label className="text-sm font-black block">
                  Marks
                </label>
                <input
                  type="number"
                  min="0"
                  max={selected.maxMarks}
                  value={marks}
                  onChange={(e) => setMarks(e.target.value)}
                  className="w-full rounded-xl border px-3 py-3 mt-2"
                  placeholder={`0 - ${selected.maxMarks}`}
                />
              </div>

              <div className="mt-4">
                <label className="text-sm font-black block">
                  Feedback
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={5}
                  className="w-full rounded-xl border px-3 py-3 mt-2 resize-y"
                  placeholder="Write constructive feedback for the student..."
                />
              </div>

              <div className="flex flex-wrap gap-2 mt-5">
                <button
                  type="button"
                  onClick={saveGrade}
                  className="rounded-xl bg-indigo-600 text-white px-4 py-3 font-black inline-flex items-center gap-2"
                >
                  <Save size={16} /> Save Grade
                </button>

                <span className="rounded-xl bg-slate-100 px-4 py-3 text-sm font-black inline-flex items-center gap-2">
                  <Star size={16} /> Max {selected.maxMarks} marks
                </span>
              </div>

              {message && (
                <div className="mt-4 rounded-2xl bg-indigo-50 p-4 text-sm font-bold text-indigo-900">
                  {message}
                </div>
              )}
            </>
          ) : (
            <div className="py-10 text-center text-slate-500">
              <ClipboardCheck className="mx-auto" />
              <p className="font-black mt-3">Select a submission</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-5">
        <div className="flex gap-3">
          <MessageSquareText className="text-indigo-600 shrink-0" />
          <div>
            <p className="font-black text-indigo-950">
              Feedback workflow
            </p>
            <p className="text-sm text-indigo-900 mt-1">
              Tutors should provide clear, constructive feedback. Students
              should receive feedback only for their own submissions.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5">
        <div className="flex gap-3">
          <ShieldCheck className="text-amber-600 shrink-0" />
          <div>
            <p className="font-black text-amber-950">
              Production authorization
            </p>
            <p className="text-sm text-amber-900 mt-1">
              Grade changes must be server-authorized and restricted to the
              assigned tutor/admin. The client must never be trusted to enforce
              tutor ownership, marks limits or final grade integrity.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5">
        <div className="flex gap-3">
          <CheckCircle2 className="text-emerald-600 shrink-0" />
          <div>
            <p className="font-black text-emerald-950">
              Existing Tuition workflow preserved
            </p>
            <p className="text-sm text-emerald-900 mt-1">
              This phase adds the grading experience without replacing existing
              tutor registration, approval, payment/UTR or historical tuition data.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
