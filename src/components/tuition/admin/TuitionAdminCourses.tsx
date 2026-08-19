import { useEffect, useState } from 'react';
import { BookOpen, ChevronRight, Plus, RefreshCw, Layers3, FileText, GraduationCap } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { createCourse, createLevel, createLesson, createModule, listCourseContent } from '@/lib/tuitionCourseAdmin';

type Course = { id: string; title: string; slug: string; category: string; level: string | null; is_active: boolean; monthly_price: number | null };
type Level = { id: string; level_name: string; display_order: number };
type Module = { id: string; title: string; level_name: string | null; is_published: boolean; display_order: number };
type Lesson = { id: string; module_id: string; title: string; is_published: boolean; display_order: number };

export default function TuitionAdminCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selected, setSelected] = useState<Course | null>(null);
  const [levels, setLevels] = useState<Level[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [courseForm, setCourseForm] = useState({ title: '', slug: '', category: 'Academic', level: 'All Levels', description: '' });
  const [levelName, setLevelName] = useState('');
  const [moduleTitle, setModuleTitle] = useState('');
  const [lessonTitle, setLessonTitle] = useState('');
  const [moduleId, setModuleId] = useState('');

  async function loadCourses() {
    setLoading(true);
    const { data, error } = await supabase.from('tuition_courses').select('id,title,slug,category,level,is_active,monthly_price').order('display_order');
    if (error) setMessage(error.message);
    setCourses((data || []) as Course[]);
    setLoading(false);
  }

  async function selectCourse(course: Course) {
    setSelected(course);
    setMessage('');
    try {
      const result = await listCourseContent(course.slug);
      setLevels(result.levels || []); setModules(result.modules || []); setLessons(result.lessons || []);
      setModuleId(result.modules?.[0]?.id || '');
    } catch (e) { setMessage(e instanceof Error ? e.message : 'Unable to load course content.'); }
  }

  useEffect(() => { void loadCourses(); }, []);

  async function addCourse() {
    if (!courseForm.title.trim() || !courseForm.slug.trim()) return setMessage('Course title and slug are required.');
    setBusy(true); setMessage('');
    try { await createCourse({ ...courseForm }); setMessage('Course created successfully.'); setCourseForm({ title: '', slug: '', category: 'Academic', level: 'All Levels', description: '' }); await loadCourses(); }
    catch (e) { setMessage(e instanceof Error ? e.message : 'Unable to create course.'); }
    finally { setBusy(false); }
  }

  async function addLevel() {
    if (!selected || !levelName.trim()) return;
    setBusy(true);
    try { await createLevel({ courseSlug: selected.slug, levelName }); setLevelName(''); await selectCourse(selected); setMessage('Level added.'); }
    catch (e) { setMessage(e instanceof Error ? e.message : 'Unable to add level.'); }
    finally { setBusy(false); }
  }

  async function addModule() {
    if (!selected || !moduleTitle.trim()) return;
    setBusy(true);
    try { await createModule({ courseSlug: selected.slug, title: moduleTitle, isPublished: true, displayOrder: modules.length + 1 }); setModuleTitle(''); await selectCourse(selected); setMessage('Module added.'); }
    catch (e) { setMessage(e instanceof Error ? e.message : 'Unable to add module.'); }
    finally { setBusy(false); }
  }

  async function addLesson() {
    if (!moduleId || !lessonTitle.trim()) return;
    setBusy(true);
    try { await createLesson({ moduleId, title: lessonTitle, isPublished: true, displayOrder: lessons.filter(l => l.module_id === moduleId).length + 1 }); setLessonTitle(''); if (selected) await selectCourse(selected); setMessage('Lesson added.'); }
    catch (e) { setMessage(e instanceof Error ? e.message : 'Unable to add lesson.'); }
    finally { setBusy(false); }
  }

  return <section>
    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
      <div><h3 className="text-xl font-black text-slate-900">Course Management</h3><p className="text-sm text-slate-500 mt-1">Category → Course → Level → Module → Lesson</p></div>
      <button onClick={() => void loadCourses()} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border bg-white text-sm font-bold"><RefreshCw size={15}/>Refresh</button>
    </div>

    {message && <div className="mb-5 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 px-4 py-3 text-sm font-semibold">{message}</div>}

    <div className="grid lg:grid-cols-[1fr_1.25fr] gap-6">
      <div className="space-y-4">
        <div className="bg-white border rounded-2xl p-5">
          <h4 className="font-extrabold flex items-center gap-2"><Plus size={17}/>Add Course</h4>
          <div className="grid gap-3 mt-4">
            <input className="border rounded-xl px-3 py-2.5" placeholder="Course title" value={courseForm.title} onChange={e=>setCourseForm({...courseForm,title:e.target.value})}/>
            <input className="border rounded-xl px-3 py-2.5" placeholder="Unique slug e.g. vedic-maths" value={courseForm.slug} onChange={e=>setCourseForm({...courseForm,slug:e.target.value.toLowerCase().replace(/\s+/g,'-')})}/>
            <input className="border rounded-xl px-3 py-2.5" placeholder="Category" value={courseForm.category} onChange={e=>setCourseForm({...courseForm,category:e.target.value})}/>
            <input className="border rounded-xl px-3 py-2.5" placeholder="Level" value={courseForm.level} onChange={e=>setCourseForm({...courseForm,level:e.target.value})}/>
            <textarea className="border rounded-xl px-3 py-2.5" placeholder="Short description" value={courseForm.description} onChange={e=>setCourseForm({...courseForm,description:e.target.value})}/>
            <button disabled={busy} onClick={() => void addCourse()} className="bg-indigo-600 text-white rounded-xl py-2.5 font-extrabold disabled:opacity-50">Create Course</button>
          </div>
        </div>

        <div className="bg-white border rounded-2xl overflow-hidden">
          <div className="p-4 border-b font-extrabold">Courses</div>
          {loading ? <div className="p-5 text-sm text-slate-500">Loading…</div> : courses.map(course => <button key={course.slug} onClick={() => void selectCourse(course)} className={`w-full text-left p-4 border-b last:border-0 hover:bg-slate-50 ${selected?.slug === course.slug ? 'bg-indigo-50' : ''}`}><div className="flex justify-between gap-3"><div><div className="font-extrabold">{course.title}</div><div className="text-xs text-indigo-600 font-bold mt-1">{course.category} · {course.level || 'All Levels'}</div></div><ChevronRight size={17}/></div></button>)}
        </div>
      </div>

      <div className="bg-white border rounded-2xl p-5">
        {!selected ? <div className="min-h-[320px] flex flex-col items-center justify-center text-center text-slate-500"><GraduationCap size={40} className="text-indigo-300"/><p className="font-bold mt-3">Select a course</p><p className="text-sm mt-1">Manage its levels, modules and lessons.</p></div> : <>
          <div className="flex items-start gap-3"><div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center"><BookOpen size={19}/></div><div><h4 className="font-black text-lg">{selected.title}</h4><p className="text-xs text-slate-500">{selected.slug}</p></div></div>

          <div className="mt-6 grid gap-5">
            <div><div className="font-extrabold flex items-center gap-2"><Layers3 size={16}/>Levels</div><div className="flex flex-wrap gap-2 mt-3">{levels.map(l=><span key={l.id} className="px-3 py-1.5 rounded-full bg-slate-100 text-sm font-bold">{l.level_name}</span>)}</div><div className="flex gap-2 mt-3"><input className="border rounded-xl px-3 py-2 flex-1" placeholder="Add level" value={levelName} onChange={e=>setLevelName(e.target.value)}/><button disabled={busy} onClick={()=>void addLevel()} className="px-4 rounded-xl bg-slate-900 text-white font-bold">Add</button></div></div>
            <div><div className="font-extrabold flex items-center gap-2"><BookOpen size={16}/>Modules</div><div className="space-y-2 mt-3">{modules.map(m=><div key={m.id} className="border rounded-xl p-3"><div className="font-bold">{m.title}</div><div className="text-xs text-emerald-600 font-semibold mt-1">{m.is_published ? 'Published' : 'Draft'}</div></div>)}</div><div className="flex gap-2 mt-3"><input className="border rounded-xl px-3 py-2 flex-1" placeholder="New module" value={moduleTitle} onChange={e=>setModuleTitle(e.target.value)}/><button disabled={busy} onClick={()=>void addModule()} className="px-4 rounded-xl bg-slate-900 text-white font-bold">Add</button></div></div>
            <div><div className="font-extrabold flex items-center gap-2"><FileText size={16}/>Lessons</div><select className="border rounded-xl px-3 py-2 mt-3 w-full" value={moduleId} onChange={e=>setModuleId(e.target.value)}><option value="">Select module</option>{modules.map(m=><option key={m.id} value={m.id}>{m.title}</option>)}</select><div className="space-y-2 mt-3">{lessons.filter(l=>l.module_id===moduleId).map(l=><div key={l.id} className="border rounded-xl p-3 text-sm font-bold">{l.title}</div>)}</div><div className="flex gap-2 mt-3"><input className="border rounded-xl px-3 py-2 flex-1" placeholder="New lesson" value={lessonTitle} onChange={e=>setLessonTitle(e.target.value)}/><button disabled={busy || !moduleId} onClick={()=>void addLesson()} className="px-4 rounded-xl bg-slate-900 text-white font-bold disabled:opacity-50">Add</button></div></div>
          </div>
        </>}
      </div>
    </div>
  </section>;
}
