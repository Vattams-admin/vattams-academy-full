import { useEffect, useState } from 'react';
import { BarChart3, RefreshCw } from 'lucide-react';
import {
  getTutorStudentReports,
  refreshProgress,
} from '@/lib/tuitionProgress';

export default function TuitionProgressReports() {
  const [rows, setRows] = useState<any[]>([]);
  const [message, setMessage] = useState('');

  const load = async () => {
    try {
      const result = await getTutorStudentReports();
      setRows(result.progress || []);
    } catch (e: any) {
      setMessage(e.message || 'Unable to load reports.');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const refresh = async (row: any) => {
    try {
      await refreshProgress(row.student_id, row.course_id,);
      setMessage('Progress refreshed.');
      await load();
    } catch (e: any) {
      setMessage(e.message || 'Unable to refresh progress.');
    }
  };

  return (
    <section className="bg-white border rounded-3xl p-5">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <BarChart3 className="text-indigo-600" />
          <div>
            <p className="text-xs font-black uppercase text-indigo-600">
              Academy Reports
            </p>
            <h2 className="text-xl font-black">Student Performance</h2>
          </div>
        </div>
        <button type="button" onClick={load} className="p-2 rounded-xl border">
          <RefreshCw size={17} />
        </button>
      </div>

      {message && (
        <p className="mt-3 rounded-xl bg-indigo-50 p-3 text-sm font-semibold text-indigo-800">
          {message}
        </p>
      )}

      <div className="space-y-3 mt-5">
        {rows.map((row) => (
          <div key={row.id} className="rounded-2xl border p-4">
            <div className="flex justify-between gap-3">
              <div>
                <p className="font-black">Student: {row.student_id}</p>
                <p className="text-xs text-slate-500">Course: {row.course_id}</p>
              </div>
              <button
                type="button"
                onClick={() => refresh(row)}
                className="rounded-xl border px-3 py-2 text-xs font-black"
              >
                Refresh
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-4">
              <Stat label="Overall" value={`${row.overall_percentage}%`} />
              <Stat label="Attendance" value={`${row.attendance_percentage}%`} />
              <Stat label="Assignments" value={`${row.assignment_average}%`} />
              <Stat label="Tests" value={`${row.test_average}%`} />
              <Stat label="Completion" value={`${row.course_completion_percentage}%`} />
            </div>

            <p className="text-sm font-bold mt-3">
              Level: {row.performance_level}
            </p>
          </div>
        ))}

        {!rows.length && (
          <p className="text-sm text-slate-400 text-center py-8">
            No progress snapshots available yet.
          </p>
        )}
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-[11px] text-slate-500 font-bold">{label}</p>
      <p className="font-black mt-1">{value}</p>
    </div>
  );
}
