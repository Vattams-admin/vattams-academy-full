import { useEffect, useState } from 'react';
import {
  Award,
  BarChart3,
  CalendarCheck,
  GraduationCap,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import {
  getGuardianAttendance,
  getGuardianCertificates,
  getGuardianDashboard,
  getGuardianProgress,
  getGuardianResults,
} from '@/lib/tuitionGuardians';

export default function TuitionGuardianDashboard({
  onLogout,
}: {
  onLogout?: () => void;
}) {
  const [dashboard, setDashboard] = useState<any>(null);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [section, setSection] = useState('progress');
  const [data, setData] = useState<any>(null);
  const [message, setMessage] = useState('');

  const loadDashboard = async () => {
    try {
      const result = await getGuardianDashboard();
      setDashboard(result);
      if (!selectedStudent && result.students?.length) {
        setSelectedStudent(result.students[0]);
      }
    } catch (error: any) {
      setMessage(error.message || 'Unable to load guardian dashboard.');
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    if (!selectedStudent) return;

    const load = async () => {
      try {
        let result;
        if (section === 'progress') result = await getGuardianProgress(selectedStudent);
        if (section === 'attendance') result = await getGuardianAttendance(selectedStudent);
        if (section === 'certificates') result = await getGuardianCertificates(selectedStudent);
        if (section === 'results') result = await getGuardianResults(selectedStudent);
        setData(result || null);
      } catch (error: any) {
        setMessage(error.message || 'Unable to load student information.');
      }
    };

    load();
  }, [selectedStudent, section]);

  const logout = () => {
    sessionStorage.removeItem('vattams_guardian_token');
    onLogout?.();
  };

  return (
    <section className="max-w-5xl mx-auto p-5 space-y-5">
      <div className="bg-white border rounded-3xl p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase text-indigo-600">VATTAMS Academy</p>
            <h1 className="text-2xl font-black">Parent / Guardian Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">
              Welcome {dashboard?.guardian?.guardian_name || 'Guardian'}
            </p>
          </div>
          <button type="button" onClick={logout} className="rounded-xl border p-2" title="Logout">
            <LogOut size={17} />
          </button>
        </div>

        {dashboard?.students?.length ? (
          <select
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            className="w-full mt-5 rounded-xl border p-3 font-bold"
          >
            {dashboard.students.map((id: string) => (
              <option key={id} value={id}>{id}</option>
            ))}
          </select>
        ) : (
          <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
            No student has been shared with this guardian yet.
          </p>
        )}
      </div>

      {message && (
        <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{message}</p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <TabButton active={section === 'progress'} onClick={() => setSection('progress')} icon={<BarChart3 size={17} />} label="Progress" />
        <TabButton active={section === 'attendance'} onClick={() => setSection('attendance')} icon={<CalendarCheck size={17} />} label="Attendance" />
        <TabButton active={section === 'results'} onClick={() => setSection('results')} icon={<GraduationCap size={17} />} label="Results" />
        <TabButton active={section === 'certificates'} onClick={() => setSection('certificates')} icon={<Award size={17} />} label="Certificates" />
      </div>

      <div className="bg-white border rounded-3xl p-5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="text-emerald-600" size={19} />
          <h2 className="font-black">
            {section === 'progress' ? 'Learning Progress' :
             section === 'attendance' ? 'Attendance' :
             section === 'results' ? 'Test Results' : 'Certificates'}
          </h2>
        </div>

        <pre className="mt-4 whitespace-pre-wrap break-words rounded-2xl bg-slate-50 p-4 text-xs overflow-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </section>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border p-3 flex items-center justify-center gap-2 text-sm font-black ${
        active ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
