import { useState } from 'react';
import { Search, TrendingUp } from 'lucide-react';
import { getTutorStudentProgress } from '@/lib/tuitionProgress';

export default function TuitionTutorProgress() {
  const [studentId, setStudentId] = useState('');
  const [progress, setProgress] = useState<any[]>([]);
  const [error, setError] = useState('');

  const load = async () => {
    if (!studentId.trim()) return;
    setError('');

    try {
      const result = await getTutorStudentProgress(studentId.trim());
      setProgress(result.progress || []);
    } catch (e: any) {
      setError(e.message || 'Unable to load progress.');
    }
  };

  return (
    <section className="bg-white border rounded-3xl p-5">
      <div className="flex items-center gap-2">
        <TrendingUp className="text-indigo-600" />
        <h2 className="text-xl font-black">Student Progress</h2>
      </div>

      <div className="flex gap-2 mt-4">
        <input
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          placeholder="Enter Student ID"
          className="flex-1 px-4 py-3 rounded-xl border border-slate-200"
        />
        <button
          type="button"
          onClick={load}
          className="px-4 py-3 rounded-xl bg-indigo-600 text-white font-bold"
        >
          <Search size={17} />
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-600 mt-3">{error}</p>
      )}

      <div className="space-y-3 mt-5">
        {progress.map((item) => (
          <div key={item.courseId} className="border rounded-2xl p-4">
            <div className="flex justify-between font-bold">
              <span>Course</span>
              <span>{Number(item.progressPercentage || 0).toFixed(0)}%</span>
            </div>

            <div className="h-3 bg-slate-100 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-indigo-600"
                style={{
                  width: `${Math.min(100, item.progressPercentage || 0)}%`,
                }}
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3 text-xs text-slate-500">
              <span>Lessons: {item.lessonsCompleted}/{item.lessonsTotal}</span>
              <span>Assignments: {item.assignmentsSubmitted}/{item.assignmentsTotal}</span>
              <span>Tests: {item.testsAttempted}/{item.testsTotal}</span>
              <span>Attendance: {item.attendancePresent}/{item.attendanceTotal}</span>
            </div>
          </div>
        ))}

        {!progress.length && !error && (
          <p className="text-sm text-slate-400">
            Search a student to view learning progress.
          </p>
        )}
      </div>
    </section>
  );
}
