import { useEffect, useState } from 'react';
import {
  Award,
  BarChart3,
  BookOpenCheck,
  CalendarCheck,
  CheckCircle2,
  Trophy,
} from 'lucide-react';
import {
  getMyProgress,
  getMyProgressHistory,
} from '@/lib/tuitionStudentProgress';

export default function TuitionStudentProgress() {
  const [progress, setProgress] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [message, setMessage] = useState('');

  const load = async () => {
    try {
      const [current, previous] = await Promise.all([
        getMyProgress(),
        getMyProgressHistory(30),
      ]);
      setProgress(current.progress || null);
      setHistory(previous.history || []);
      setMessage('');
    } catch (error: any) {
      setMessage(error.message || 'Unable to load learning progress.');
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <section className="max-w-5xl mx-auto p-5 space-y-5">
      <div className="bg-white border rounded-3xl p-5">
        <p className="text-xs font-black uppercase text-indigo-600">VATTAMS Academy</p>
        <h1 className="text-2xl font-black mt-1">My Learning Progress</h1>
        <p className="text-sm text-slate-500 mt-1">
          A simple view of learning activity, attendance and assessment performance.
        </p>

        {message && (
          <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
            {message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Metric icon={<BarChart3 size={18} />} label="Overall Progress" value={`${progress?.progress_percentage ?? 0}%`} />
        <Metric icon={<CalendarCheck size={18} />} label="Attendance" value={`${progress?.attendance_percentage ?? 0}%`} />
        <Metric icon={<BookOpenCheck size={18} />} label="Assignments" value={progress?.assignments_submitted ?? 0} />
        <Metric icon={<Trophy size={18} />} label="Competitions" value={progress?.competitions_attempted ?? 0} />
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <ProgressCard
          title="Class Completion"
          value={progress?.classes_total
            ? Math.round((progress.classes_completed / progress.classes_total) * 100)
            : 0}
          subtitle={`${progress?.classes_completed ?? 0} of ${progress?.classes_total ?? 0} classes completed`}
        />

        <ProgressCard
          title="Assessment Performance"
          value={Math.round(progress?.average_test_percentage ?? 0)}
          subtitle={`${progress?.tests_attempted ?? 0} tests attempted`}
        />
      </div>

      <div className="bg-white border rounded-3xl p-5">
        <h2 className="font-black text-lg">30-Day Progress History</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="p-3">Date</th>
                <th className="p-3">Progress</th>
                <th className="p-3">Attendance</th>
                <th className="p-3">Test Avg.</th>
                <th className="p-3">Certificates</th>
              </tr>
            </thead>
            <tbody>
              {history.map((row) => (
                <tr key={row.snapshot_date} className="border-b last:border-0">
                  <td className="p-3 font-bold">{row.snapshot_date}</td>
                  <td className="p-3">{row.progress_percentage}%</td>
                  <td className="p-3">{row.attendance_percentage}%</td>
                  <td className="p-3">{row.average_test_percentage}%</td>
                  <td className="p-3">{row.certificates_issued}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!history.length && (
          <p className="text-sm text-slate-400 text-center py-8">
            Progress history will appear as Academy activity is recorded.
          </p>
        )}
      </div>

      <div className="rounded-2xl border bg-indigo-50 p-4 text-sm text-indigo-900 flex gap-3">
        <Award className="shrink-0" size={18} />
        <span>
          Progress is an informational learning indicator. It does not replace
          official course results or certificate decisions.
        </span>
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
  value: string | number;
}) {
  return (
    <div className="bg-white border rounded-2xl p-4">
      <div className="flex items-center gap-2 text-indigo-600">
        {icon}
        <span className="text-xs font-black">{label}</span>
      </div>
      <p className="text-2xl font-black mt-2">{value}</p>
    </div>
  );
}

function ProgressCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: number;
  subtitle: string;
}) {
  const safe = Math.min(100, Math.max(0, Number(value) || 0));

  return (
    <div className="bg-white border rounded-3xl p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-black">{title}</h3>
        <CheckCircle2 className="text-emerald-600" size={19} />
      </div>
      <p className="text-3xl font-black mt-4">{safe}%</p>
      <div className="h-3 bg-slate-100 rounded-full mt-3 overflow-hidden">
        <div
          className="h-full bg-indigo-600 rounded-full transition-all"
          style={{ width: `${safe}%` }}
        />
      </div>
      <p className="text-xs text-slate-500 mt-3">{subtitle}</p>
    </div>
  );
}
