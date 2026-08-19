import { useMemo, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  FileText,
  Layers3,
  RefreshCw,
  ShieldCheck,
  TriangleAlert,
} from 'lucide-react';
import {
  groupCurriculumByStage,
  validateCurriculum,
  type CurriculumItem,
} from '@/lib/academyCurriculum';

const SAMPLE_CATALOG: CurriculumItem[] = [
  { id: 'academic', title: 'Academic', stage: 'category', active: true, order: 1 },
  { id: 'mathematics', title: 'Mathematics', stage: 'course', parentId: 'academic', active: true, order: 1 },
  { id: 'math-level-1', title: 'Foundation Level', stage: 'level', parentId: 'mathematics', active: true, order: 1 },
  { id: 'math-module-1', title: 'Number Skills', stage: 'module', parentId: 'math-level-1', active: true, order: 1 },
  { id: 'math-lesson-1', title: 'Number Sense', stage: 'lesson', parentId: 'math-module-1', active: true, order: 1 },
];

export default function AcademyCurriculumGovernance() {
  const [items, setItems] = useState<CurriculumItem[]>(SAMPLE_CATALOG);

  const validation = useMemo(() => validateCurriculum(items), [items]);
  const grouped = useMemo(() => groupCurriculumByStage(items), [items]);

  const addCourse = () => {
    setItems((current) => [
      ...current,
      {
        id: `course-${Date.now()}`,
        title: 'New Course',
        stage: 'course',
        parentId: 'academic',
        active: false,
        order: current.filter((item) => item.stage === 'course').length + 1,
      },
    ]);
  };

  const reset = () => setItems(SAMPLE_CATALOG);

  return (
    <section className="space-y-5">
      <div className="bg-white border rounded-3xl p-5">
        <div className="flex flex-wrap justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-indigo-50 text-indigo-600 p-3">
              <BookOpen size={22} />
            </div>
            <div>
              <p className="text-xs font-black uppercase text-indigo-600">
                Curriculum Governance
              </p>
              <h2 className="text-2xl font-black mt-1">
                Academy Course Structure
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Validate the Academy learning hierarchy before publishing content.
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={addCourse}
              className="rounded-xl bg-indigo-600 text-white px-4 py-2 font-black"
            >
              Add Course Draft
            </button>
            <button
              type="button"
              onClick={reset}
              className="rounded-xl border px-4 py-2 font-black inline-flex items-center gap-2"
            >
              <RefreshCw size={16} /> Reset
            </button>
          </div>
        </div>
      </div>

      <div className={`rounded-3xl border p-5 ${
        validation.valid
          ? 'bg-emerald-50 border-emerald-200'
          : 'bg-rose-50 border-rose-200'
      }`}>
        <div className="flex items-start gap-3">
          {validation.valid
            ? <CheckCircle2 className="text-emerald-600 shrink-0" />
            : <TriangleAlert className="text-rose-600 shrink-0" />}
          <div>
            <p className="font-black">
              {validation.valid ? 'Curriculum structure valid' : 'Curriculum requires review'}
            </p>
            <p className="text-sm mt-1">
              {validation.totalItems} items checked · {validation.issues.length} issue(s)
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Metric label="Categories" value={grouped.category.length} />
        <Metric label="Courses" value={grouped.course.length} />
        <Metric label="Levels" value={grouped.level.length} />
        <Metric label="Modules" value={grouped.module.length} />
        <Metric label="Lessons" value={grouped.lesson.length} />
      </div>

      <div className="bg-white border rounded-3xl p-5">
        <div className="flex items-center gap-2">
          <Layers3 size={19} className="text-indigo-600" />
          <h3 className="font-black">Learning Hierarchy</h3>
        </div>

        <div className="space-y-2 mt-4">
          {items.map((item) => (
            <div key={item.id} className="rounded-2xl bg-slate-50 p-3 flex items-start gap-3">
              <StageIcon stage={item.stage} />
              <div className="min-w-0">
                <p className="font-black text-sm">{item.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {item.stage} · {item.id}
                  {item.parentId ? ` · parent: ${item.parentId}` : ''}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border rounded-3xl p-5">
        <div className="flex items-center gap-2">
          <ShieldCheck size={19} className="text-indigo-600" />
          <h3 className="font-black">Validation Issues</h3>
        </div>

        {validation.issues.length === 0 ? (
          <p className="text-sm text-emerald-700 font-bold mt-4">
            No structural issues found.
          </p>
        ) : (
          <div className="space-y-2 mt-4">
            {validation.issues.map((issue, index) => (
              <div key={index} className="rounded-xl bg-amber-50 p-3 text-sm">
                <span className="font-black uppercase text-xs mr-2">
                  {issue.severity}
                </span>
                {issue.message}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function StageIcon({ stage }: { stage: CurriculumItem['stage'] }) {
  if (stage === 'course') return <BookOpen size={18} className="text-indigo-600 shrink-0" />;
  if (stage === 'lesson') return <FileText size={18} className="text-indigo-600 shrink-0" />;
  return <Layers3 size={18} className="text-slate-500 shrink-0" />;
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white border rounded-2xl p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-2xl font-black mt-1">{value}</p>
    </div>
  );
}
