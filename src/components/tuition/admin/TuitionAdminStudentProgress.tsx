import { useState } from 'react';
import { RefreshCw, Search, TrendingUp } from 'lucide-react';
import {
  getStudentProgress,
  getStudentProgressHistory,
  refreshStudentProgress,
} from '@/lib/tuitionStudentProgress';

export default function TuitionAdminStudentProgress() {
  const [studentId, setStudentId] = useState('');
  const [progress, setProgress] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [message, setMessage] = useState('');

  const load = async () => {
    if (!studentId.trim()) {
      setMessage('Enter a Student ID.');
      return;
    }

    try {
      const [current, previous] = await Promise.all([
        getStudentProgress(studentId.trim()),
        getStudentProgressHistory(studentId.trim(), 30),
      ]);
      setProgress(current.progress || null);
      setHistory(previous.history || []);
      setMessage('');
    } catch (error: any) {
      setMessage(error.message || 'Unable to load student progress.');
    }
  };

  const refresh = async () => {
    if (!studentId.trim()) return;

    try {
      await refreshStudentProgress(studentId.trim());
      await load();
    } catch (error: any) {
      setMessage(error.message || 'Unable to refresh student progress.');
    }
  };

  return (
    <section className="space-y-5">
      <div className="bg-white border rounded-3xl p-5">
        <div className="flex items-center gap-3">
          <TrendingUp className="text-indigo-600" />
          <div>
            <p className="text-xs font-black uppercase text-indigo-600">Academy Admin</p>
            <h2 className="text-xl font-black">Student Progress</h2>
          </div>
        </div>

        <div className="flex gap-2 mt-5">
          <input
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            placeholder="Student ID"
            className="flex-1 rounded-xl border p-3"
          />
          <button
            type="button"
            onClick={load}
            className="rounded-xl bg-indigo-600 px-4 text-white"
            title="Load"
          >
            <Search size={17} />
          </button>
          <button
            type="button"
            onClick={refresh}
            className="rounded-xl border px-4"
            title="Refresh snapshot"
          >
            <RefreshCw size={17} />
          </button>
        </div>

        {message && (
          <p className="mt-4 rounded-xl bg-indigo-50 p-3 text-sm text-indigo-800">
            {message}
          </p>
        )}
      </div>

      {progress && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Metric label="Progress" value={`${progress.progress_percentage}%`} />
          <Metric label="Attendance" value={`${progress.attendance_percentage}%`} />
          <Metric label="Test Average" value={`${progress.average_test_percentage}%`} />
          <Metric label="Certificates" value={progress.certificates_issued} />
        </div>
      )}

      <div className="bg-white border rounded-3xl p-5 overflow-x-auto">
        <h3 className="font-black">Progress History</h3>
        <table className="w-full text-sm mt-4">
          <thead>
            <tr className="border-b text-left">
              <th className="p-3">Date</th>
              <th className="p-3">Progress</th>
              <th className="p-3">Attendance</th>
              <th className="p-3">Tests</th>
              <th className="p-3">Assignments</th>
              <th className="p-3">Competitions</th>
            </tr>
          </thead>
          <tbody>
            {history.map((row) => (
              <tr key={row.snapshot_date} className="border-b last:border-0">
                <td className="p-3">{row.snapshot_date}</td>
                <td className="p-3">{row.progress_percentage}%</td>
                <td className="p-3">{row.attendance_percentage}%</td>
                <td className="p-3">{row.tests_attempted}</td>
                <td className="p-3">{row.assignments_submitted}</td>
                <td className="p-3">{row.competitions_attempted}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white border rounded-2xl p-4">
      <p className="text-xs font-black text-slate-500">{label}</p>
      <p className="text-2xl font-black mt-2">{value}</p>
    </div>
  );
}
