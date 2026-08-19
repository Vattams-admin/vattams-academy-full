import { useMemo, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Filter,
  GraduationCap,
  Search,
  Star,
} from 'lucide-react';
import {
  filterCourses,
  getCourseCategories,
  getCourseLevels,
  type AcademyCourse,
} from '@/lib/academyCourseCatalogue';

const DEMO_COURSES: AcademyCourse[] = [
  {
    id: 'mathematics',
    title: 'Mathematics',
    category: 'Academic',
    level: 'School',
    description: 'Structured online Mathematics learning with lessons, practice and assessments.',
    mode: 'online',
    featured: true,
    active: true,
    tags: ['maths', 'school', 'academic'],
  },
  {
    id: 'science',
    title: 'Science',
    category: 'Academic',
    level: 'School',
    description: 'Concept-focused Science learning for school students.',
    mode: 'online',
    active: true,
    tags: ['science', 'school'],
  },
  {
    id: 'python',
    title: 'Python',
    category: 'Technology',
    level: 'Beginner',
    description: 'Beginner-friendly Python programming with practical exercises.',
    mode: 'online',
    featured: true,
    active: true,
    tags: ['coding', 'programming', 'python'],
  },
  {
    id: 'ai-fundamentals',
    title: 'AI Fundamentals',
    category: 'Technology',
    level: 'Beginner',
    description: 'Understand artificial intelligence concepts and responsible AI use.',
    mode: 'online',
    active: true,
    tags: ['ai', 'artificial intelligence', 'technology'],
  },
  {
    id: 'public-speaking',
    title: 'Public Speaking',
    category: 'Communication',
    level: 'All Levels',
    description: 'Build confidence, presentation structure and effective speaking skills.',
    mode: 'online',
    active: true,
    tags: ['speaking', 'communication', 'presentation'],
  },
  {
    id: 'tnpsc-group-iv',
    title: 'TNPSC Group IV',
    category: 'Competitive Exams',
    level: 'Foundation',
    description: 'Foundation preparation with structured practice and mock tests.',
    mode: 'online',
    featured: true,
    active: true,
    tags: ['tnpsc', 'competitive', 'government exams'],
  },
  {
    id: 'ielts',
    title: 'IELTS',
    category: 'International',
    level: 'All Levels',
    description: 'Online IELTS preparation covering core exam skills.',
    mode: 'online',
    active: true,
    tags: ['english', 'ielts', 'international'],
  },
];

export default function AcademyCourseCatalogue({
  courses = DEMO_COURSES,
}: {
  courses?: AcademyCourse[];
}) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [level, setLevel] = useState('All');
  const [selected, setSelected] = useState<AcademyCourse | null>(null);

  const categories = useMemo(() => getCourseCategories(courses), [courses]);
  const levels = useMemo(() => getCourseLevels(courses), [courses]);

  const filtered = useMemo(
    () => filterCourses(courses, { query, category, level }),
    [courses, query, category, level],
  );

  const featured = courses.filter((course) => course.active && course.featured);

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
                VATTAMS Academy
              </p>
              <h2 className="text-2xl font-black mt-1">Course Catalogue</h2>
              <p className="text-sm text-slate-500 mt-1">
                Discover online courses across Academic, Foundation, Communication,
                Technology, Competitive Exams and International learning.
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-emerald-50 text-emerald-700 px-4 py-2 text-sm font-black">
            Online Learning Only
          </div>
        </div>

        <div className="grid md:grid-cols-[1fr_auto_auto] gap-3 mt-5">
          <label className="relative block">
            <Search size={18} className="absolute left-3 top-3.5 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-xl border pl-10 pr-3 py-3"
              placeholder="Search courses, skills or topics..."
            />
          </label>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-xl border px-3 py-3 bg-white"
            aria-label="Course category"
          >
            {categories.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>

          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="rounded-xl border px-3 py-3 bg-white"
            aria-label="Course level"
          >
            {levels.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>
      </div>

      {featured.length > 0 && !query && category === 'All' && level === 'All' && (
        <div className="bg-white border rounded-3xl p-5">
          <div className="flex items-center gap-2">
            <Star size={18} className="text-amber-500" />
            <h3 className="font-black">Featured Courses</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-3 mt-4">
            {featured.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                featured
                onView={() => setSelected(course)}
              />
            ))}
          </div>
        </div>
      )}

      <div className="bg-white border rounded-3xl p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-indigo-600" />
            <h3 className="font-black">All Courses</h3>
          </div>
          <span className="text-xs text-slate-500 font-bold">
            {filtered.length} course{filtered.length === 1 ? '' : 's'}
          </span>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
          {filtered.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onView={() => setSelected(course)}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-10">
            <BookOpen className="mx-auto text-slate-400" />
            <p className="font-black mt-3">No matching courses</p>
            <p className="text-sm text-slate-500 mt-1">
              Try another keyword, category or level.
            </p>
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 bg-black/40 p-4 flex items-center justify-center">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-xl">
            <p className="text-xs font-black uppercase text-indigo-600">
              Course Details
            </p>
            <h3 className="text-2xl font-black mt-2">{selected.title}</h3>
            <p className="text-sm text-slate-500 mt-3">
              {selected.description}
            </p>

            <div className="flex flex-wrap gap-2 mt-4">
              <span className="rounded-full bg-indigo-50 text-indigo-700 px-3 py-1 text-xs font-black">
                {selected.category}
              </span>
              <span className="rounded-full bg-slate-100 text-slate-700 px-3 py-1 text-xs font-black">
                {selected.level}
              </span>
              <span className="rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-black">
                Online
              </span>
            </div>

            <div className="flex gap-2 mt-6">
              <a
                href="#/student-dashboard"
                className="rounded-xl bg-indigo-600 text-white px-4 py-3 font-black"
              >
                Request Enrollment
              </a>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-xl border px-4 py-3 font-black"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-5">
        <div className="flex gap-3">
          <CheckCircle2 className="text-indigo-600 shrink-0" />
          <div>
            <p className="font-black text-indigo-950">
              Catalogue safety
            </p>
            <p className="text-sm text-indigo-900 mt-1">
              This catalogue is a UI foundation. Production course availability,
              pricing, enrollment eligibility and access must come from the
              authorized backend and existing Tuition rules.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function CourseCard({
  course,
  featured = false,
  onView,
}: {
  course: AcademyCourse;
  featured?: boolean;
  onView: () => void;
}) {
  return (
    <article className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="rounded-2xl bg-white p-3 text-indigo-600">
          <BookOpen size={20} />
        </div>
        {featured && (
          <span className="rounded-full bg-amber-50 text-amber-700 px-2 py-1 text-[10px] font-black uppercase">
            Featured
          </span>
        )}
      </div>

      <h4 className="font-black mt-4">{course.title}</h4>
      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
        {course.description}
      </p>

      <div className="flex flex-wrap gap-2 mt-3">
        <span className="rounded-full bg-white px-2 py-1 text-[10px] font-black text-slate-600">
          {course.category}
        </span>
        <span className="rounded-full bg-white px-2 py-1 text-[10px] font-black text-slate-600">
          {course.level}
        </span>
      </div>

      <button
        type="button"
        onClick={onView}
        className="w-full mt-4 rounded-xl bg-indigo-600 text-white px-4 py-2.5 text-sm font-black"
      >
        View Course
      </button>
    </article>
  );
}
