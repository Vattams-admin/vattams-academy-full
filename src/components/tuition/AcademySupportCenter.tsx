import { useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  LifeBuoy,
  RefreshCw,
} from 'lucide-react';
import {
  clearSupportDraft,
  createSupportReference,
  getSupportContext,
  loadSupportDraft,
  saveSupportDraft,
  type SupportCategory,
  type SupportPriority,
} from '@/lib/academySupport';

const categories: { value: SupportCategory; label: string }[] = [
  { value: 'login', label: 'Login / Account' },
  { value: 'course', label: 'Course / Enrollment' },
  { value: 'classroom', label: 'Classroom' },
  { value: 'assignment', label: 'Assignment' },
  { value: 'test', label: 'Test / Exam' },
  { value: 'competition', label: 'Competition' },
  { value: 'certificate', label: 'Certificate / QR' },
  { value: 'payment', label: 'Payment / UTR' },
  { value: 'notification', label: 'Notification' },
  { value: 'technical', label: 'Technical Issue' },
  { value: 'other', label: 'Other' },
];

export default function AcademySupportCenter() {
  const saved = useMemo(() => loadSupportDraft(), []);
  const [category, setCategory] = useState<SupportCategory>(saved?.category || 'technical');
  const [priority, setPriority] = useState<SupportPriority>(saved?.priority || 'normal');
  const [subject, setSubject] = useState(saved?.subject || '');
  const [description, setDescription] = useState(saved?.description || '');
  const [reference, setReference] = useState('');
  const [copied, setCopied] = useState(false);

  const context = useMemo(() => getSupportContext(), []);

  const save = () => {
    saveSupportDraft({ category, priority, subject, description });
    setReference(createSupportReference());
  };

  const reset = () => {
    clearSupportDraft();
    setCategory('technical');
    setPriority('normal');
    setSubject('');
    setDescription('');
    setReference('');
  };

  const copyReference = async () => {
    if (!reference) return;
    try {
      await navigator.clipboard.writeText(reference);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="space-y-5">
      <div className="bg-white border rounded-3xl p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600">
            <LifeBuoy size={22} />
          </div>
          <div>
            <p className="text-xs font-black uppercase text-indigo-600">Support</p>
            <h2 className="text-2xl font-black mt-1">VATTAMS Academy Help Center</h2>
            <p className="text-sm text-slate-500 mt-1">
              Prepare a clear issue report for the Academy support team.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white border rounded-3xl p-5">
        <div className="grid md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-xs font-black text-slate-600">Category</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as SupportCategory)}
              className="mt-2 w-full rounded-xl border px-3 py-3 bg-white"
            >
              {categories.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-black text-slate-600">Priority</span>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as SupportPriority)}
              className="mt-2 w-full rounded-xl border px-3 py-3 bg-white"
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </label>
        </div>

        <label className="block mt-4">
          <span className="text-xs font-black text-slate-600">Subject</span>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            maxLength={120}
            placeholder="Example: Student login fails on mobile data"
            className="mt-2 w-full rounded-xl border px-3 py-3"
          />
        </label>

        <label className="block mt-4">
          <span className="text-xs font-black text-slate-600">Description</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={2000}
            rows={6}
            placeholder="Tell us what happened, when it happened, and what you expected."
            className="mt-2 w-full rounded-xl border px-3 py-3 resize-y"
          />
        </label>

        <div className="mt-4 rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-black text-slate-600">Diagnostic context</p>
          <p className="text-xs text-slate-500 mt-1 break-all">
            Route: {context.route}
          </p>
          <p className="text-xs text-slate-500">
            Network: {context.online ? 'Online' : 'Offline'}
          </p>
          <p className="text-xs text-slate-500">
            Time: {context.timestamp}
          </p>
        </div>

        <div className="flex flex-wrap gap-3 mt-5">
          <button
            type="button"
            onClick={save}
            disabled={!subject.trim() || !description.trim()}
            className="rounded-xl bg-indigo-600 text-white px-5 py-3 font-black disabled:opacity-50"
          >
            Prepare Support Report
          </button>

          <button
            type="button"
            onClick={reset}
            className="rounded-xl border px-5 py-3 font-black inline-flex items-center gap-2"
          >
            <RefreshCw size={16} /> Clear
          </button>
        </div>
      </div>

      {reference && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="text-emerald-600 shrink-0" />
            <div className="flex-1">
              <p className="font-black text-emerald-950">Support reference prepared</p>
              <p className="text-sm text-emerald-900 mt-1">
                Share this reference with the Academy support team.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <code className="rounded-xl bg-white border px-3 py-2 font-black">
                  {reference}
                </code>
                <button
                  type="button"
                  onClick={copyReference}
                  className="rounded-xl border bg-white px-3 py-2"
                  aria-label="Copy support reference"
                  title="Copy support reference"
                >
                  <Copy size={16} />
                </button>
              </div>
              {copied && (
                <p className="text-xs text-emerald-700 font-bold mt-2">Copied.</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5">
        <div className="flex gap-3">
          <AlertCircle className="text-amber-600 shrink-0" />
          <div>
            <p className="font-black text-amber-950">Privacy & security</p>
            <p className="text-sm text-amber-900 mt-1">
              Do not include passwords, OTPs, full card numbers, private API keys,
              or other secrets in the support description.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
