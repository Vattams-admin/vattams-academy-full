import { useState } from 'react';
import { Award, Plus, ShieldOff } from 'lucide-react';
import { createCertificate, revokeCertificate } from '@/lib/tuitionCertificates';

export default function TuitionAdminCertificates() {
  const [form, setForm] = useState({
    studentId: '',
    courseId: '',
    title: '',
    description: '',
    certificateType: 'course',
    issueDate: new Date().toISOString().slice(0, 10),
    completionDate: '',
    percentage: '',
    grade: '',
  });
  const [created, setCreated] = useState<any>(null);
  const [message, setMessage] = useState('');

  const create = async () => {
    try {
      const result = await createCertificate({
        ...form,
        percentage: form.percentage ? Number(form.percentage) : null,
      });
      setCreated(result.certificate);
      setMessage('Certificate issued successfully.');
    } catch (error: any) {
      setMessage(error.message || 'Unable to issue certificate.');
    }
  };

  const revoke = async () => {
    if (!created?.certificate_number) return;
    try {
      setMessage('Revocation requires the certificate record ID in the admin workflow.');
    } catch {
      setMessage('Unable to revoke certificate.');
    }
  };

  return (
    <section className="space-y-5">
      <div className="bg-white border rounded-3xl p-5">
        <div className="flex items-center gap-2">
          <Award className="text-indigo-600" />
          <div>
            <p className="text-xs font-black uppercase text-indigo-600">Academy Admin</p>
            <h2 className="text-xl font-black">Certificates</h2>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-3 mt-5">
          <input value={form.studentId} onChange={(e) => setForm({...form, studentId: e.target.value})} placeholder="Student ID" className="rounded-xl border p-3" />
          <input value={form.courseId} onChange={(e) => setForm({...form, courseId: e.target.value})} placeholder="Course ID (optional)" className="rounded-xl border p-3" />
          <input value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} placeholder="Certificate title" className="rounded-xl border p-3" />
          <select value={form.certificateType} onChange={(e) => setForm({...form, certificateType: e.target.value})} className="rounded-xl border p-3">
            <option value="course">Course</option>
            <option value="competition">Competition</option>
            <option value="achievement">Achievement</option>
            <option value="completion">Completion</option>
          </select>
          <textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} placeholder="Description" className="rounded-xl border p-3" />
          <input type="date" value={form.issueDate} onChange={(e) => setForm({...form, issueDate: e.target.value})} className="rounded-xl border p-3" />
          <input type="date" value={form.completionDate} onChange={(e) => setForm({...form, completionDate: e.target.value})} className="rounded-xl border p-3" />
          <input type="number" value={form.percentage} onChange={(e) => setForm({...form, percentage: e.target.value})} placeholder="Percentage (optional)" className="rounded-xl border p-3" />
          <input value={form.grade} onChange={(e) => setForm({...form, grade: e.target.value})} placeholder="Grade (optional)" className="rounded-xl border p-3" />
        </div>

        <button type="button" onClick={create} className="mt-4 rounded-xl bg-indigo-600 text-white px-5 py-3 font-black inline-flex items-center gap-2">
          <Plus size={16} /> Issue Certificate
        </button>

        {message && <p className="mt-4 rounded-xl bg-indigo-50 p-3 text-sm text-indigo-800">{message}</p>}
      </div>

      {created && (
        <div className="bg-white border rounded-3xl p-5">
          <p className="text-xs font-black uppercase text-emerald-600">Issued</p>
          <h3 className="text-xl font-black mt-1">{created.title}</h3>
          <p className="text-sm text-slate-500 mt-2">Certificate No: <strong>{created.certificate_number}</strong></p>

          <div className="mt-4 rounded-2xl bg-slate-50 p-4">
            <p className="text-xs text-slate-500">Verification URL</p>
            <p className="text-sm font-bold break-all mt-1">{created.verification_url}</p>
          </div>

          <button type="button" onClick={revoke} className="mt-4 rounded-xl border border-rose-200 text-rose-700 px-4 py-2 font-black inline-flex items-center gap-2">
            <ShieldOff size={16} /> Certificate Actions
          </button>
        </div>
      )}
    </section>
  );
}
