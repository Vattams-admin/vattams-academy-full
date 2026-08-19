import { useMemo, useState } from 'react';
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  GraduationCap,
  PlayCircle,
  Search,
  TestTube2,
} from 'lucide-react';
import {
  canRequestEnrollment,
  getStudentDashboardSummary,
  type StudentDashboardSummary,
  type StudentEnrollment,
} from '@/lib/academyStudentDashboard';

const DEMO_ENROLLMENTS: StudentEnrollment[] = [
  {
    id: 'enrol-1',
    studentId: 'student-demo',
    courseId: 'mathematics',
    courseTitle: 'Mathematics',
    enrolledAt: '2026-08-10',
    status: 'active',
    progressPercentage: 72,
  },
  {
    id: 'enrol-2',
    studentId: 'student-demo',
    courseId: 'spoken-english',
    courseTitle: 'Spoken English',
    enrolledAt: '2026-08-12',
    status: 'active',
    progressPercentage: 48,
  },
];

const DEMO_SUMMARY: StudentDashboardSummary = {
  activeCourses: 2,
  completedCourses: 1,
  upcomingClasses: 2,
  pendingAssignments: 3,
  pendingTests: 1,
  attendancePercentage: 91,
};

const COURSE_OPTIONS = [
  'Mathematics',
  'Science',
  'English',
  'Computer Science',
  'Python',
  'AI Fundamentals',
  'TNPSC Group IV',
  'IELTS',
];

export default function AcademyStudentDashboard({
  initialEnrollments = DEMO_ENROLLMENTS,
  summary = DEMO_SUMMARY,
}: {
  initialEnrollments?: StudentEnrollment[];
  summary?: StudentDashboardSummary;
}) {
  const [enrollments, setEnrollments] = useState(initialEnrollments);
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState('');

  const dashboard = useMemo(
    () => getStudentDashboardSummary(enrollments, summary),
    [enrollments, summary],
  );

  const filteredCourses = COURSE_OPTIONS.filter((course) =>
    course.toLowerCase().includes(query.toLowerCase()),
  );

  const requestEnrollment = (course: string) => {
    const courseId = course.toLowerCase().replace(/\s+/g, '-');

    if (!canRequestEnrollment(courseId)) return;

    if (enrollments.some((item) => item.courseId === courseId)) {
      setMessage(`${course} is already in your course list.`);
      return;
    }

    setEnrollments((current) => [
      ...current,
      {
        id: `enrol-${Date.now()}`,
        studentId: 'student-demo',
        courseId,
        courseTitle: course,
        enrolledAt: new Date().toISOString(),
        status: 'pending',
        progressPercentage: 0,
      },
    ]);
    setMessage(`Enrollment request created for ${course}.`);
  };

  return (
    <section className="space-y-5">
      <div className="bg-white border rounded-3xl p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-indigo-50 text-indigo-600 p-3">
              <GraduationCap size={22} />
            </div>
            <div>
              <p className="text-xs font-black uppercase text-indigo-600">
                Student Portal
              </p>
              <h2 className="text-2xl font-black mt-1">
                Student Dashboard
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Courses, classroom, assignments, tests, attendance and progress in one place.
              </p>
            </div>
          </div>

          <a
            href="#/tuition-courses"
            className="rounded-xl bg-indigo-600 text-white px-4 py-3 font-black inline-flex items-center gap-2"
          >
            <BookOpen size={16} /> Explore Courses
          </a>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <Metric label="Active Courses" value={dashboard.activeCourses} />
        <Metric label="Completed" value={dashboard.completedCourses} />
        <Metric label="Classes" value={dashboard.upcomingClasses} />
        <Metric label="Assignments" value={dashboard.pendingAssignments} />
        <Metric label="Tests" value={dashboard.pendingTests} />
        <Metric label="Attendance" value={`${dashboard.attendancePercentage}%`} />
      </div>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-5">
        <div className="bg-white border rounded-3xl p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase text-indigo-600">
                My Learning
              </p>
              <h3 className="text-xl font-black mt-1">My Courses</h3>
            </div>
            <a href="#/tuition-courses" className="text-sm font-black text-indigo-600">
              Browse
            </a>
          </div>

          <div className="space-y-3 mt-4">
            {enrollments.map((enrollment) => (
              <article key={enrollment.id} className="rounded-2xl bg-slate-50 p-4">
                <div className="flex justify-between gap-3">
                  <div>
                    <p className="font-black">{enrollment.courseTitle}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {enrollment.status === 'active'
                        ? 'Active enrollment'
                        : `Enrollment ${enrollment.status}`}
                    </p>
                  </div>
                  <span className="text-sm font-black text-indigo-600">
                    {enrollment.progressPercentage}%
                  </span>
                </div>

                <div className="mt-3 h-2 rounded-full bg-white overflow-hidden">
                  <div
                    className="h-full bg-indigo-600"
                    style={{ width: `${Math.min(100, enrollment.progressPercentage)}%` }}
                  />
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  <a href="#/classroom" className="rounded-xl border px-3 py-2 text-xs font-black">
                    Classroom
                  </a>
                  <a href="#/assignments" className="rounded-xl border px-3 py-2 text-xs font-black">
                    Assignments
                  </a>
                  <a href="#/results" className="rounded-xl border px-3 py-2 text-xs font-black">
                    Results
                  </a>
                </div>
              </article>
            ))}

            {enrollments.length === 0 && (
              <p className="text-sm text-slate-500">No courses enrolled yet.</p>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <Quick
            href="#/classroom"
            icon={<PlayCircle size={19} />}
            title="Classroom"
            description="Join upcoming online classes."
          />
          <Quick
            href="#/assignments"
            icon={<ClipboardCheck size={19} />}
            title="Assignments"
            description="Complete pending learning work."
          />
          <Quick
            href="#/tests"
            icon={<TestTube2 size={19} />}
            title="Tests"
            description="Take your scheduled assessments."
          />
          <Quick
            href="#/attendance"
            icon={<CalendarDays size={19} />}
            title="Attendance"
            description="Check your attendance record."
          />
        </div>
      </div>

      <div className="bg-white border rounded-3xl p-5">
        <div>
          <p className="text-xs font-black uppercase text-indigo-600">
            Course Enrollment
          </p>
          <h3 className="text-xl font-black mt-1">Find a Course</h3>
        </div>

        <div className="relative mt-4">
          <Search size={18} className="absolute left-3 top-3.5 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-xl border pl-10 pr-3 py-3"
            placeholder="Search courses..."
          />
        </div>

        <div className="grid md:grid-cols-2 gap-3 mt-4">
          {filteredCourses.map((course) => (
            <div
              key={course}
              className="rounded-2xl bg-slate-50 p-4 flex items-center justify-between gap-3"
            >
              <div>
                <p className="font-black text-sm">{course}</p>
                <p className="text-xs text-slate-500 mt-1">
                  Request enrollment
                </p>
              </div>
              <button
                type="button"
                onClick={() => requestEnrollment(course)}
                className="rounded-xl bg-indigo-600 text-white px-3 py-2 text-xs font-black"
              >
                Enroll
              </button>
            </div>
          ))}
        </div>

        {message && (
          <p className="text-sm text-indigo-700 font-bold mt-4">
            {message}
          </p>
        )}
      </div>

      <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5">
        <div className="flex gap-3">
          <CheckCircle2 className="text-emerald-600 shrink-0" />
          <div>
            <p className="font-black text-emerald-950">
              Enrollment data safety
            </p>
            <p className="text-sm text-emerald-900 mt-1">
              This phase provides the student-side enrollment experience. Final
              enrollment approval, payment rules and course access must remain
              server-authorized and compatible with existing Tuition logic.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white border rounded-2xl p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-2xl font-black mt-1">{value}</p>
    </div>
  );
}

function Quick({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <a href={href} className="block bg-white border rounded-3xl p-5">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-indigo-50 text-indigo-600 p-3">
          {icon}
        </div>
        <div>
          <p className="font-black">{title}</p>
          <p className="text-sm text-slate-500 mt-1">{description}</p>
        </div>
      </div>
    </a>
  );
}
