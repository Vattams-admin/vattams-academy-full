import { useEffect, useState } from 'react';
import {
  Activity,
  Award,
  BarChart3,
  BookOpen,
  GraduationCap,
  RefreshCw,
  Trophy,
  Users,
} from 'lucide-react';
import {
  getAdminActivity,
  getAdminOverview,
  getDailyAnalytics,
  refreshDailyAnalytics,
} from '@/lib/tuitionAnalytics';

export default function TuitionAdminAnalytics() {
  const [overview, setOverview] = useState<any>(null);
  const [daily, setDaily] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [message, setMessage] = useState('');

  const load = async () => {
    try {
      const [o, d, a] = await Promise.all([
        getAdminOverview(),
        getDailyAnalytics(30),
        getAdminActivity(30),
      ]);
      setOverview(o.overview);
      setDaily(d.daily || []);
      setActivity(a.activity || []);
      setMessage('');
    } catch (e: any) {
      setMessage(e.message || 'Unable to load Academy analytics.');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const refreshToday = async () => {
    try {
      await refreshDailyAnalytics();
      await load();
    } catch (e: any) {
      setMessage(e.message || 'Unable to refresh analytics.');
    }
  };

  return (
    <section className="space-y-5">
      {message && (
        <p className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">
          {message}
        </p>
      )}

      <div className="bg-white border rounded-3xl p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <BarChart3 className="text-indigo-600" />
            <div>
              <p className="text-xs font-black uppercase text-indigo-600">
                VATTAMS Academy
              </p>
              <h2 className="text-xl font-black">Admin Analytics</h2>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={refreshToday} className="rounded-xl border p-2" title="Refresh today">
              <RefreshCw size={17} />
            </button>
            <button type="button" onClick={load} className="rounded-xl border p-2" title="Reload dashboard">
              <Activity size={17} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
          <Card icon={<Users size={18} />} label="Students" value={overview?.students ?? '—'} />
          <Card icon={<GraduationCap size={18} />} label="Approved Tutors" value={overview?.approvedTutors ?? '—'} />
          <Card icon={<BookOpen size={18} />} label="Courses" value={overview?.courses ?? '—'} />
          <Card icon={<Trophy size={18} />} label="Competitions" value={overview?.competitions ?? '—'} />
          <Card icon={<Award size={18} />} label="Certificates" value={overview?.certificates ?? '—'} />
          <Card icon={<Users size={18} />} label="Enrollments" value={overview?.enrollments ?? '—'} />
          <Card icon={<Activity size={18} />} label="Active Students" value={overview?.activeStudents ?? '—'} />
          <Card icon={<Activity size={18} />} label="Unread Notifications" value={overview?.unreadNotifications ?? '—'} />
        </div>
      </div>

      <div className="bg-white border rounded-3xl p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-black text-lg">30-Day Activity</h3>
            <p className="text-xs text-slate-500 mt-1">
              Classes, attendance, assignments and tests
            </p>
          </div>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="p-3">Date</th>
                <th className="p-3">Classes</th>
                <th className="p-3">Completed</th>
                <th className="p-3">Attendance</th>
                <th className="p-3">Assignments</th>
                <th className="p-3">Tests</th>
                <th className="p-3">Certificates</th>
              </tr>
            </thead>
            <tbody>
              {daily.map((row) => (
                <tr key={row.metric_date} className="border-b last:border-0">
                  <td className="p-3 font-bold">{row.metric_date}</td>
                  <td className="p-3">{row.classes_total}</td>
                  <td className="p-3">{row.classes_completed}</td>
                  <td className="p-3">{row.attendance_percentage}%</td>
                  <td className="p-3">{row.assignments_submitted}</td>
                  <td className="p-3">{row.tests_attempted}</td>
                  <td className="p-3">{row.certificates_issued}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!daily.length && (
          <p className="text-sm text-slate-400 text-center py-8">
            No daily analytics snapshots yet. Use refresh to generate today's snapshot.
          </p>
        )}
      </div>

      <div className="bg-white border rounded-3xl p-5">
        <h3 className="font-black text-lg">Recent Admin Activity</h3>
        <div className="space-y-2 mt-4">
          {activity.map((item) => (
            <div key={item.id} className="rounded-xl border p-3">
              <p className="text-sm font-bold">{item.description || item.action}</p>
              <p className="text-[11px] text-slate-500 mt-1">
                {new Date(item.created_at).toLocaleString()}
              </p>
            </div>
          ))}
          {!activity.length && (
            <p className="text-sm text-slate-400 py-6 text-center">
              No admin activity recorded yet.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function Card({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border p-4">
      <div className="flex items-center gap-2 text-indigo-600">
        {icon}
        <span className="text-xs font-black">{label}</span>
      </div>
      <p className="text-2xl font-black mt-2">{value}</p>
    </div>
  );
}
