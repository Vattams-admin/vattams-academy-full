import { useEffect, useState } from 'react';
import {
  Award,
  BarChart3,
  BookOpenCheck,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
} from 'lucide-react';
import { getMyProgress, getMyResults } from '@/lib/tuitionProgress';

export default function TuitionStudentProgress({
  courseId,
}: {
  courseId?: string;
}) {
  const [progress, setProgress] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [message, setMessage] = useState('');

  const load = async () => {
    try {
      const [p, r] = await Promise.all([
        getMyProgress(courseId),
        getMyResults(courseId),
      ]);
      setProgress(p.progress || []);
      setResults(r.results || []);
    } catch (e: any) {
      setMessage(e.message || 'Unable to load your progress.');
    }
  };

  useEffect(() => {
    load();
  }, [courseId]);

  const latest = progress[0];

  return (
    <section className="space-y-5">
      {message && (
        <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {message}
        </p>
      )}

      <div className="bg-white border rounded-3xl p-5">
        <div className="flex items-center gap-3">
          <BarChart3 className="text-indigo-600" />
          <div>
            <p className="text-xs font-black uppercase text-indigo-600">
              Student Performance
            </p>
            <h2 className="text-xl font-black">My Progress</h2>
          </div>
        </div>

        {!latest ? (
          <p className="text-sm text-slate-400 mt-6">
            Your first progress snapshot will appear after classroom or assessment activity is recorded.
          </p>
        ) : (
          <>
            <div className="mt-6 rounded-2xl bg-indigo-50 p-5">
              <p className="text-sm font-bold text-indigo-800">Overall Performance</p>
              <p className="text-4xl font-black text-indigo-950 mt-1">
                {latest.overall_percentage}%
              </p>
              <p className="font-bold mt-1">{latest.performance_level}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              <Metric
                icon={<Clock3 size={17} />}
                label="Attendance"
                value={`${latest.attendance_percentage}%`}
              />
              <Metric
                icon={<ClipboardCheck size={17} />}
                label="Assignments"
                value={`${latest.assignment_average}%`}
              />
              <Metric
                icon={<CheckCircle2 size={17} />}
                label="Tests"
                value={`${latest.test_average}%`}
              />
              <Metric
                icon={<BookOpenCheck size={17} />}
                label="Completion"
                value={`${latest.course_completion_percentage}%`}
              />
            </div>
          </>
        )}
      </div>

      <div className="bg-white border rounded-3xl p-5">
        <div className="flex items-center gap-3">
          <Award className="text-amber-600" />
          <h2 className="text-xl font-black">Recent Results</h2>
        </div>

        <div className="space-y-3 mt-4">
          {results.map((item) => (
            <div key={item.id} className="rounded-2xl border p-4">
              <p className="font-black">{item.title}</p>
              <p className="text-xs text-slate-500 mt-1">
                {item.result_type} · {item.percentage ?? '—'}%
              </p>
              <p className="text-sm font-bold mt-2">
                {item.passed == null
                  ? item.grade || 'Pending'
                  : item.passed
                    ? 'Passed'
                    : 'Not Passed'}
              </p>
            </div>
          ))}
          {!results.length && (
            <p className="text-sm text-slate-400">No result records yet.</p>
          )}
        </div>
      </div>
    </section>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border p-4">
      <div className="flex items-center gap-2 text-indigo-600">
        {icon}
        <span className="text-xs font-black">{label}</span>
      </div>
      <p className="text-xl font-black mt-2">{value}</p>
    </div>
  );
}
