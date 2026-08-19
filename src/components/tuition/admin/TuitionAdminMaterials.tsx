import { useEffect, useMemo, useState } from 'react';
import {
  ExternalLink,
  FileText,
  Link2,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
  Upload,
} from 'lucide-react';
import {
  createExternalMaterial,
  deleteMaterial,
  listMaterials,
  setMaterialPublished,
  uploadPdfMaterial,
  AdminMaterial,
} from '@/lib/tuitionMaterialsAdmin';

const CATEGORIES = [
  ['courseMaterials', 'Course Materials'],
  ['studyMaterials', 'Study Materials'],
  ['worksheets', 'Worksheets'],
  ['questionBanks', 'Question Banks'],
  ['testPapers', 'Test Papers'],
  ['mockExams', 'Mock Exams'],
  ['solutions', 'Solutions'],
  ['revisionMaterials', 'Revision Materials'],
  ['examPreparation', 'Exam Preparation'],
];

const emptyForm = {
  courseSlug: '',
  title: '',
  description: '',
  category: 'courseMaterials',
  subject: '',
  topic: '',
  grade: '',
  externalUrl: '',
  isPublished: true,
};

export default function TuitionAdminMaterials() {
  const [materials, setMaterials] = useState<AdminMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'pdf' | 'link'>('pdf');
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState<File | null>(null);

  const publishedCount = useMemo(
    () => materials.filter((item) => item.is_published).length,
    [materials]
  );

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await listMaterials();
      setMaterials(result.materials || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load materials.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const update = (key: keyof typeof form, value: string | boolean) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!form.courseSlug.trim() || !form.title.trim()) {
      setError('Course slug and material title are required.');
      return;
    }

    if (mode === 'pdf' && !file) {
      setError('Choose a PDF file to upload.');
      return;
    }

    if (mode === 'link' && !/^https?:\/\//i.test(form.externalUrl.trim())) {
      setError('Enter a valid http(s) resource URL.');
      return;
    }

    setSaving(true);
    try {
      if (mode === 'pdf' && file) {
        await uploadPdfMaterial({ ...form, file });
      } else {
        await createExternalMaterial({ ...form });
      }
      setForm(emptyForm);
      setFile(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save material.');
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (item: AdminMaterial) => {
    try {
      await setMaterialPublished(item.id, !item.is_published);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update material.');
    }
  };

  const remove = async (item: AdminMaterial) => {
    if (!window.confirm(`Delete “${item.title}”?`)) return;
    try {
      await deleteMaterial(item.id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete material.');
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-900">Learning Materials</h2>
          <p className="text-sm text-slate-500 mt-1">
            {materials.length} materials • {publishedCount} published
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold"
        >
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={submit} className="rounded-3xl border border-slate-200 bg-white p-5 md:p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="font-black text-slate-900">Add Learning Material</h3>
            <p className="text-xs text-slate-500 mt-1">PDF uploads are watermarked before student delivery.</p>
          </div>
          <div className="flex rounded-xl bg-slate-100 p-1">
            <button type="button" onClick={() => setMode('pdf')} className={`px-3 py-2 rounded-lg text-xs font-bold ${mode === 'pdf' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}>
              <Upload size={13} className="inline mr-1" /> PDF
            </button>
            <button type="button" onClick={() => setMode('link')} className={`px-3 py-2 rounded-lg text-xs font-bold ${mode === 'link' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}>
              <Link2 size={13} className="inline mr-1" /> Link
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <input value={form.courseSlug} onChange={(e) => update('courseSlug', e.target.value)} placeholder="Course slug (e.g. mathematics)" className="rounded-xl border border-slate-200 px-3 py-3 text-sm" />
          <input value={form.title} onChange={(e) => update('title', e.target.value)} placeholder="Material title" className="rounded-xl border border-slate-200 px-3 py-3 text-sm" />
          <select value={form.category} onChange={(e) => update('category', e.target.value)} className="rounded-xl border border-slate-200 px-3 py-3 text-sm">
            {CATEGORIES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <input value={form.subject} onChange={(e) => update('subject', e.target.value)} placeholder="Subject" className="rounded-xl border border-slate-200 px-3 py-3 text-sm" />
          <input value={form.topic} onChange={(e) => update('topic', e.target.value)} placeholder="Topic" className="rounded-xl border border-slate-200 px-3 py-3 text-sm" />
          <input value={form.grade} onChange={(e) => update('grade', e.target.value)} placeholder="Grade / Level" className="rounded-xl border border-slate-200 px-3 py-3 text-sm" />
        </div>

        <textarea value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Short description" rows={3} className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm" />

        {mode === 'pdf' ? (
          <label className="block rounded-2xl border-2 border-dashed border-slate-200 p-5 cursor-pointer hover:border-indigo-300">
            <div className="flex items-center gap-3">
              <FileText className="text-indigo-600" />
              <div>
                <p className="font-bold text-sm">Choose PDF</p>
                <p className="text-xs text-slate-500">Maximum 50 MB. Originals remain private.</p>
              </div>
            </div>
            <input type="file" accept="application/pdf,.pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} className="hidden" />
            {file && <p className="text-xs font-semibold text-indigo-600 mt-3">Selected: {file.name}</p>}
          </label>
        ) : (
          <input value={form.externalUrl} onChange={(e) => update('externalUrl', e.target.value)} placeholder="https://..." className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm" />
        )}

        <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
          <input type="checkbox" checked={form.isPublished} onChange={(e) => update('isPublished', e.target.checked)} /> Publish immediately
        </label>

        <button disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-black text-white disabled:opacity-60">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          {saving ? 'Uploading…' : 'Add Material'}
        </button>
      </form>

      {loading ? (
        <div className="rounded-2xl bg-white border border-slate-200 p-8 text-center text-sm text-slate-500">Loading materials…</div>
      ) : materials.length === 0 ? (
        <div className="rounded-2xl bg-white border border-dashed border-slate-300 p-10 text-center">
          <FileText className="mx-auto text-indigo-500" />
          <p className="font-bold mt-3">No materials added yet.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {materials.map((item) => (
            <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-wide font-black text-indigo-600">{item.category}</p>
                  <h3 className="font-black text-slate-900 mt-1">{item.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">{item.course_slug}</p>
                </div>
                <span className={`text-[11px] font-black px-2 py-1 rounded-full ${item.is_published ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                  {item.is_published ? 'Published' : 'Draft'}
                </span>
              </div>

              {item.description && <p className="text-sm text-slate-600 mt-3">{item.description}</p>}

              <div className="flex flex-wrap gap-2 mt-4">
                {(item.resource_url || item.external_url) && (
                  <a href={item.resource_url || item.external_url || '#'} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 text-indigo-700 px-3 py-2 text-xs font-bold">
                    Open <ExternalLink size={13} />
                  </a>
                )}
                <button type="button" onClick={() => toggle(item)} className="rounded-lg border px-3 py-2 text-xs font-bold">
                  {item.is_published ? 'Unpublish' : 'Publish'}
                </button>
                <button type="button" onClick={() => remove(item)} className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 text-red-600 px-3 py-2 text-xs font-bold">
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
