import { useState } from 'react';
import { BookOpen, CalendarDays, ClipboardCheck, FileText, FlaskConical, GraduationCap, UserCheck, Users } from 'lucide-react';
import TuitionAdminClasses from '@/pages/tuition/admin/TuitionAdminCLasses';
import TuitionAdminAttendanceOverview from '@/pages/tuition/admin/TuitionAdminAttendanceOverview';
import TuitionAdminMaterials from '@/components/tuition/admin/TuitionAdminMaterials';
import TuitionAdminTutors from '@/components/tuition/admin/TuitionAdminTutors';
import TuitionAdminStudents from '@/components/tuition/admin/TuitionAdminStudents';
import TuitionAdminTrials from '@/components/tuition/admin/TuitionAdminTrials';
import TuitionAdminCourses from '@/components/tuition/admin/TuitionAdminCourses';

type Tab = 'overview' | 'students' | 'tutors' | 'courses' | 'trials' | 'classes' | 'attendance' | 'materials';

export default function TuitionAdminPanel() {
  const [tab, setTab] = useState<Tab>('overview');
  const tabs = [
    ['overview', 'Overview', GraduationCap], ['students', 'Students', Users], ['tutors', 'Tutors', UserCheck],
    ['courses', 'Courses', BookOpen], ['trials', 'Trials', FlaskConical], ['classes', 'Classroom', CalendarDays],
    ['attendance', 'Attendance', ClipboardCheck], ['materials', 'Materials', FileText],
  ] as const;

  return <div>
    <div className="flex items-center gap-3 mb-6"><div className="h-11 w-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center"><GraduationCap size={23}/></div><div><h2 className="text-2xl font-black text-slate-900">VATTAMS Academy Admin</h2><p className="text-sm text-slate-500">Student, tutor, course and online classroom management.</p></div></div>
    <div className="flex gap-2 overflow-x-auto pb-2 mb-6">{tabs.map(([id,label,Icon]) => <button key={id} onClick={() => setTab(id)} className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap ${tab===id ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-200'}`}><Icon size={15}/>{label}</button>)}</div>
    {tab === 'overview' && <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"><div className="p-6 rounded-2xl bg-white border border-slate-200"><Users className="text-indigo-600"/><h3 className="font-extrabold mt-4">Students</h3><p className="text-sm text-slate-500 mt-1">Registration and learner management.</p></div><div className="p-6 rounded-2xl bg-white border border-slate-200"><UserCheck className="text-indigo-600"/><h3 className="font-extrabold mt-4">Tutors</h3><p className="text-sm text-slate-500 mt-1">Registration, payments and approval.</p></div><div className="p-6 rounded-2xl bg-white border border-slate-200"><BookOpen className="text-indigo-600"/><h3 className="font-extrabold mt-4">Courses</h3><p className="text-sm text-slate-500 mt-1">Academics, skills and exam preparation.</p></div><div className="p-6 rounded-2xl bg-white border border-slate-200"><CalendarDays className="text-indigo-600"/><h3 className="font-extrabold mt-4">Classroom</h3><p className="text-sm text-slate-500 mt-1">Classes and attendance workflow.</p></div></div>}
    {tab === 'students' && <TuitionAdminStudents />}
    {tab === 'tutors' && <TuitionAdminTutors />}
    {tab === 'courses' && <TuitionAdminCourses />}
    {tab === 'trials' && <TuitionAdminTrials />}
    {tab === 'classes' && <TuitionAdminClasses />}
    {tab === 'attendance' && <TuitionAdminAttendanceOverview />}
    {tab === 'materials' && <TuitionAdminMaterials />}
  </div>;
}
