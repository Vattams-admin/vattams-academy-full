import { useMemo, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Link2,
  PlayCircle,
  Upload,
  Video,
} from 'lucide-react';
import {
  canSubmitAssignment,
  calculateAssignmentPercentage,
  filterPublishedAssignments,
  filterPublishedMaterials,
  type AcademyAssignment,
  type AcademyAssignmentSubmission,
  type AcademyMaterial,
} from '@/lib/academyMaterialsAssignments';

const DEMO_MATERIALS: AcademyMaterial[] = [
  {
    id: 'material-1',
    courseId: 'mathematics',
    moduleId: 'module-1',
    lessonId: 'lesson-1',
    title: 'Fractions Study Notes',
    description: 'Lesson notes for revision.',
    type: 'pdf',
    resourceUrl: '#/materials/fractions',
    downloadable: true,
    published: true,
  },
  {
    id: 'material-2',
    courseId: 'mathematics',
    moduleId: 'module-1',
    lessonId: 'lesson-1',
    title: 'Fractions Video Lesson',
    description: 'Recorded explanation and examples.',
    type: 'video',
    resourceUrl: '#/classroom/recording',
    downloadable: false,
    published: true,
  },
  {
    id: 'material-3',
    courseId: 'mathematics',
    moduleId: 'module-2',
    lessonId: 'lesson-4',
    title: 'Practice Worksheet',
    description: 'Additional practice questions.',
    type: 'document',
    resourceUrl: '#/materials/worksheet',
    downloadable: true,
    published: true,
  },
];

const DEMO_ASSIGNMENTS: AcademyAssignment[] = [
  {
    id: 'assignment-1',
    courseId: 'mathematics',
    moduleId: 'module-1',
    lessonId: 'lesson-2',
    title: 'Fractions Practice',
    instructions: 'Complete the practice questions and submit your answers.',
    dueAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    maxMarks: 20,
    status: 'published',
  },
  {
    id: 'assignment-2',
    courseId: 'mathematics',
    moduleId: 'module-2',
    lessonId: 'lesson-5',
    title: 'Word Problems',
    instructions: 'Solve the assigned word problems with working steps.',
    dueAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    maxMarks: 25,
    status: 'published',
  },
];

const DEMO_SUBMISSIONS: AcademyAssignmentSubmission[] = [];

export default function AcademyMaterialsAssignments({
  materials = DEMO_MATERIALS,
  assignments = DEMO_ASSIGNMENTS,
}: {
  materials?: AcademyMaterial[];
  assignments?: AcademyAssignment[];
}) {
  const [submissions, setSubmissions] =
    useState<AcademyAssignmentSubmission[]>(DEMO_SUBMISSIONS);
  const [selectedCourse, setSelectedCourse] = useState('mathematics');
  const [message, setMessage] = useState('');

  const courseMaterials = useMemo(
    () => filterPublishedMaterials(materials, selectedCourse),
    [materials, selectedCourse],
  );

  const courseAssignments = useMemo(
    () => filterPublishedAssignments(assignments, selectedCourse),
    [assignments, selectedCourse],
  );

  const submitAssignment = (assignment: AcademyAssignment) => {
    if (!canSubmitAssignment(assignment)) {
      setMessage('This assignment is no longer accepting submissions.');
      return;
    }

    const existing = submissions.find(
      (item) =>
        item.assignmentId === assignment.id &&
        item.studentId === 'student-demo',
    );

    if (existing) {
      setMessage('A submission already exists for this assignment.');
      return;
    }

    setSubmissions((current) => [
      ...current,
      {
        assignmentId: assignment.id,
        studentId: 'student-demo',
        submittedAt: new Date().toISOString(),
        status: 'submitted',
      },
    ]);

    setMessage(`Submission started for ${assignment.title}.`);
  };

  return (
    <section className="space-y-5">
      <div className="bg-white border rounded-3xl p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-indigo-50 text-indigo-600 p-3">
              <BookOpen size={22} />
            </div>
            <div>
              <p className="text-xs font-black uppercase text-indigo-600">
                Learning Content
              </p>
              <h2 className="text-2xl font-black mt-1">
                Materials & Assignments
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Access course materials and manage student assignment submissions.
              </p>
            </div>
          </div>

          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="rounded-xl border px-3 py-3 bg-white font-bold"
            aria-label="Course"
          >
            <option value="mathematics">Mathematics</option>
            <option value="science">Science</option>
            <option value="python">Python</option>
          </select>
        </div>
      </div>

      <div className="bg-white border rounded-3xl p-5">
        <div className="flex items-center gap-2">
          <FileText size={18} className="text-indigo-600" />
          <h3 className="font-black">Published Materials</h3>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3 mt-4">
          {courseMaterials.map((material) => (
            <article key={material.id} className="rounded-2xl bg-slate-50 p-4">
              <MaterialIcon type={material.type} />
              <h4 className="font-black mt-3">{material.title}</h4>
              <p className="text-xs text-slate-500 mt-1">
                {material.description}
              </p>

              <div className="flex gap-2 mt-4">
                <a
                  href={material.resourceUrl}
                  className="rounded-xl bg-indigo-600 text-white px-3 py-2 text-xs font-black"
                >
                  Open
                </a>
                {material.downloadable && (
                  <a
                    href={material.resourceUrl}
                    className="rounded-xl border px-3 py-2 text-xs font-black"
                  >
                    Download
                  </a>
                )}
              </div>
            </article>
          ))}

          {courseMaterials.length === 0 && (
            <p className="text-sm text-slate-500">
              No published materials for this course.
            </p>
          )}
        </div>
      </div>

      <div className="bg-white border rounded-3xl p-5">
        <div className="flex items-center gap-2">
          <ClipboardCheck size={18} className="text-indigo-600" />
          <h3 className="font-black">Assignments</h3>
        </div>

        <div className="space-y-3 mt-4">
          {courseAssignments.map((assignment) => {
            const submission = submissions.find(
              (item) =>
                item.assignmentId === assignment.id &&
                item.studentId === 'student-demo',
            );

            return (
              <article
                key={assignment.id}
                className="rounded-2xl bg-slate-50 p-4"
              >
                <div className="flex flex-wrap justify-between gap-3">
                  <div>
                    <h4 className="font-black">{assignment.title}</h4>
                    <p className="text-sm text-slate-600 mt-1">
                      {assignment.instructions}
                    </p>
                    <p className="text-xs text-slate-500 mt-2">
                      {assignment.dueAt
                        ? `Due ${new Date(assignment.dueAt).toLocaleString('en-IN')}`
                        : 'No deadline'}{' '}
                      · {assignment.maxMarks} marks
                    </p>
                  </div>

                  <span className={`self-start rounded-full px-3 py-1 text-xs font-black ${
                    submission
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}>
                    {submission ? submission.status : 'Not submitted'}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  {!submission && (
                    <button
                      type="button"
                      onClick={() => submitAssignment(assignment)}
                      className="rounded-xl bg-indigo-600 text-white px-4 py-2.5 text-sm font-black inline-flex items-center gap-2"
                    >
                      <Upload size={15} /> Submit Assignment
                    </button>
                  )}

                  {submission?.marks !== undefined && (
                    <span className="rounded-xl bg-white border px-4 py-2.5 text-sm font-black">
                      {submission.marks}/{assignment.maxMarks} ·{' '}
                      {Math.round(
                        calculateAssignmentPercentage(
                          submission.marks,
                          assignment.maxMarks,
                        ),
                      )}%
                    </span>
                  )}
                </div>
              </article>
            );
          })}

          {courseAssignments.length === 0 && (
            <p className="text-sm text-slate-500">
              No published assignments for this course.
            </p>
          )}
        </div>
      </div>

      {message && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-5">
          <p className="font-bold text-indigo-900">{message}</p>
        </div>
      )}

      <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5">
        <div className="flex gap-3">
          <CheckCircle2 className="text-amber-600 shrink-0" />
          <div>
            <p className="font-black text-amber-950">
              Production submission security
            </p>
            <p className="text-sm text-amber-900 mt-1">
              The demo submission state is local UI only. Production file uploads,
              submissions, deadlines, grading and feedback must be server-authorized
              and protected by RLS.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function MaterialIcon({
  type,
}: {
  type: AcademyMaterial['type'];
}) {
  if (type === 'video') return <PlayCircle className="text-indigo-600" />;
  if (type === 'link') return <Link2 className="text-indigo-600" />;
  if (type === 'audio') return <Video className="text-indigo-600" />;
  return <FileText className="text-indigo-600" />;
}
