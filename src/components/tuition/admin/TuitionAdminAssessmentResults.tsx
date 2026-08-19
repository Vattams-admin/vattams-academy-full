import { useEffect, useState } from 'react';
import { BarChart3, RefreshCw } from 'lucide-react';
import {
  listTestResults,
  listAssignments,
} from '@/lib/tuitionAssessments';

export default function TuitionAdminAssessmentResults() {
  const [results, setResults] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [message, setMessage] = useState('');

  const load = async () => {
    try {
      const [r, a] = await Promise.all([
        listTestResults(),
        listAssignments(),
      ]);
      setResults(r.attempts || []);
      setAssignments(a.assignments || []);
    } catch (e: any) {
      setMessage(e.message || 'Unable to load assessment results.');
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <section className="bg-white border rounded-3xl p-5">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <BarChart3 className="text-indigo-600" />
          <h2 className="text-xl font-black">Assessment Results</h2>
        </div>
        <button type="button" onClick={load} className="p-2 rounded-xl border">
          <RefreshCw size={17} />
        </button>
      </div>

      {message && (
        <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {message}
        </p>
      )}

      <div className="space-y-3 mt-5">
        {results.map((item) => (
          <div key={item.id} className="rounded-2xl border p-4">
            <p className="font-black">Student: {item.student_id}</p>
            <p className="text-sm mt-1">
              Score: {item.score}/{item.max_score}
            </p>
            <p className="text-xs text-slate-500">
              {item.percentage}% · {item.passed ? 'Passed' : 'Not passed'} ·{' '}
              {item.status}
            </p>
          </div>
        ))}

        {!results.length && (
          <p className="text-sm text-slate-400">No test results yet.</p>
        )}
      </div>

      <div className="mt-6">
        <h3 className="font-black">Assignment Queue</h3>
        <p className="text-xs text-slate-500 mt-1">
          Tutor review remains the authoritative step for subjective assignment scores.
        </p>
        <div className="space-y-2 mt-3">
          {assignments.map((item) => (
            <div key={item.id} className="rounded-xl border p-3 text-sm">
              {item.title}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
