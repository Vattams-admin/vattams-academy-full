import { useEffect, useState } from 'react';
import {
  BarChart3,
  BookOpenCheck,
  CalendarCheck2,
  FileBadge2,
  GraduationCap,
  RefreshCw,
  Trophy,
  UsersRound,
} from 'lucide-react';
import {
  getDashboardReport,
  getStudentProgressReport,
  getTutorPerformanceReport,
  getCoursePerformanceReport,
  getAttendanceReport,
  getAssessmentReport,
  getCompetitionReport,
  getCertificateReport,
} from '@/lib/tuitionReports';

const last30 = () => {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().slice(0, 10);
};

export default function TuitionAdminReports() {
  const [start, setStart] = useState(last30());
  const [end, setEnd] = useState(new Date().toISOString().slice(0, 10));
  const [dashboard, setDashboard] = useState<any>(null);
  const [students, setStudents] = useState<any>(null);
  const [tutors, setTutors] = useState<any>(null);
  const [courses, setCourses] = useState<any>(null);
  const [attendance, setAttendance] = useState<any>(null);
  const [assessments, setAssessments] = useState<any>(null);
  const [competitions, setCompetitions] = useState<any>(null);
  const [certificates, setCertificates] = useState<any>(null);
  const [message, setMessage] = useState('');

  const load = async () => {
    setMessage('');
    try {
      const payload = { periodStart: start, periodEnd: end };
      const [
        d, s, t, c, a, ass, comp, cert,
      ] = await Promise.all([
        getDashboardReport(start, end),
        getStudentProgressReport(payload),
        getTutorPerformanceReport(payload),
        getCoursePerformanceReport(payload),
        getAttendanceReport(payload),
        getAssessmentReport(payload),
        getCompetitionReport(payload),
        getCertificateReport(payload),
      ]);
      setDashboard(d);
      setStudents(s);
      setTutors(t);
      setCourses(c);
      setAttendance(a);
      setAssessments(ass);
      setCompetitions(comp);
      setCertificates(cert);
    } catch (error: any) {
      setMessage(error.message || 'Unable to load reports.');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const cards = [
    ['Students', dashboard?.totals?.students ?? '—', UsersRound],
    ['Tutors', dashboard?.totals?.tutors ?? '—', GraduationCap],
    ['Courses', dashboard?.totals?.courses ?? '—', BookOpenCheck],
    ['Classes in period', dashboard?.totals?.classes ?? '—', CalendarCheck2],
    ['Tests', dashboard?.totals?.tests ?? '—', FileBadge2],
    ['Competitions', dashboard?.totals?.competitions ?? '—', Trophy],
  ] as const;

  return (
    <section className="space-y-5">
      <div className="bg-white border rounded-3xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase text-indigo-600">VATTAMS Academy</p>
            <h2 className="text-2xl font-black mt-1">Reports & Analytics</h2>
            <p className="text-sm text-slate-500 mt-1">Operational and academic performance overview.</p>
          </div>
          <button type="button" onClick={load} className="rounded-xl border px-4 py-2 font-black inline-flex items-center gap-2">
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mt-5">
          <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="rounded-xl border p-2" />
          <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="rounded-xl border p-2" />
          <button type="button" onClick={load} className="rounded-xl bg-indigo-600 text-white px-4 py-2 font-black">
            Apply Period
          </button>
        </div>

        {message && <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{message}</p>}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {cards.map(([label, value, Icon]) => (
          <div key={label} className="bg-white border rounded-2xl p-4">
            <Icon size={18} className="text-indigo-600" />
            <p className="text-xs text-slate-500 mt-3">{label}</p>
            <p className="text-2xl font-black mt-1">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <Panel title="Attendance" icon={<CalendarCheck2 size={18} />}>
          <Metric label="Records" value={attendance?.total ?? '—'} />
          <Metric label="Present" value={attendance?.present ?? '—'} />
          <Metric label="Absent/Other" value={attendance?.absent ?? '—'} />
          <Metric label="Attendance rate" value={`${attendance?.attendanceRate ?? 0}%`} />
        </Panel>

        <Panel title="Assessments" icon={<BarChart3 size={18} />}>
          <Metric label="Assignment submissions" value={assessments?.assignments?.submissions ?? '—'} />
          <Metric label="Reviewed assignments" value={assessments?.assignments?.reviewed ?? '—'} />
          <Metric label="Test attempts" value={assessments?.tests?.attempts ?? '—'} />
          <Metric label="Average test %" value={`${assessments?.tests?.averagePercentage ?? 0}%`} />
        </Panel>

        <Panel title="Competitions" icon={<Trophy size={18} />}>
          <Metric label="Results" value={competitions?.results ?? '—'} />
          <Metric label="Average %" value={`${competitions?.averagePercentage ?? 0}%`} />
          <Metric label="Excellence" value={competitions?.awards?.excellence ?? 0} />
          <Metric label="Distinction" value={competitions?.awards?.distinction ?? 0} />
        </Panel>

        <Panel title="Certificates" icon={<FileBadge2 size={18} />}>
          <Metric label="Issued" value={certificates?.issued ?? '—'} />
          <Metric label="Revoked" value={certificates?.revoked ?? '—'} />
          <Metric label="Course" value={certificates?.byType?.course ?? 0} />
          <Metric label="Competition" value={certificates?.byType?.competition ?? 0} />
        </Panel>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <Table title="Student Progress" rows={students?.students || []} columns={[
          ['student_id', 'Student'],
          ['attendanceRate', 'Attendance %'],
          ['assignmentSubmissions', 'Assignments'],
          ['testAverage', 'Test Avg %'],
          ['certificates', 'Certificates'],
        ]} />

        <Table title="Tutor Performance" rows={tutors?.tutors || []} columns={[
          ['employee_id', 'Tutor'],
          ['classesCreated', 'Classes'],
          ['completedClasses', 'Completed'],
          ['assignmentsCreated', 'Assignments'],
          ['testsCreated', 'Tests'],
        ]} />

        <Table title="Course Activity" rows={courses?.courses || []} columns={[
          ['name', 'Course'],
          ['assignments', 'Assignments'],
          ['tests', 'Tests'],
          ['competitions', 'Competitions'],
          ['certificates', 'Certificates'],
        ]} />
      </div>
    </section>
  );
}

function Panel({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white border rounded-3xl p-5">
      <div className="flex items-center gap-2 font-black">
        <span className="text-indigo-600">{icon}</span>{title}
      </div>
      <div className="grid grid-cols-2 gap-3 mt-4">{children}</div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="font-black mt-1">{value}</p>
    </div>
  );
}

function Table({
  title,
  rows,
  columns,
}: {
  title: string;
  rows: any[];
  columns: [string, string][];
}) {
  return (
    <div className="bg-white border rounded-3xl p-5 overflow-x-auto">
      <h3 className="font-black mb-3">{title}</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left">
            {columns.map(([key, label]) => <th key={key} className="py-2 pr-4 text-xs text-slate-500">{label}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 20).map((row, i) => (
            <tr key={row.id || i} className="border-b last:border-0">
              {columns.map(([key]) => <td key={key} className="py-3 pr-4 font-bold">{row[key] ?? '—'}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
      {!rows.length && <p className="text-sm text-slate-400 py-5">No report data for this period.</p>}
    </div>
  );
}
