import { useMemo, useState } from 'react';
import {
  CheckCircle2,
  FileEdit,
  Eye,
  Lock,
  Plus,
  Save,
  Send,
  ShieldCheck,
  TriangleAlert,
} from 'lucide-react';
import {
  canPublishContent,
  nextContentVersion,
  validateContentDraft,
  type AcademyContentDraft,
  type ContentStatus,
  type ContentType,
} from '@/lib/academyContentAuthoring';

const initialDraft: AcademyContentDraft = {
  id: `content-${Date.now()}`,
  title: '',
  type: 'lesson',
  courseId: '',
  description: '',
  status: 'draft',
  order: 1,
  version: 1,
};

export default function AcademyContentAuthoring() {
  const [draft, setDraft] = useState<AcademyContentDraft>(initialDraft);
  const [saved, setSaved] = useState(false);

  const issues = useMemo(() => validateContentDraft(draft), [draft]);
  const publishable = canPublishContent(draft);

  const update = <K extends keyof AcademyContentDraft>(
    key: K,
    value: AcademyContentDraft[K],
  ) => {
    setSaved(false);
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const saveDraft = () => {
    setDraft((current) => ({ ...current, status: 'draft' }));
    setSaved(true);
  };

  const sendForReview = () => {
    if (!publishable) return;
    setDraft((current) => ({ ...current, status: 'review' }));
    setSaved(true);
  };

  const publish = () => {
    if (!publishable || draft.status !== 'review') return;
    setDraft((current) => ({
      ...current,
      status: 'published',
      version: nextContentVersion(current.version),
    }));
    setSaved(true);
  };

  const createNew = () => {
    setDraft({
      ...initialDraft,
      id: `content-${Date.now()}`,
    });
    setSaved(false);
  };

  return (
    <section className="space-y-5">
      <div className="bg-white border rounded-3xl p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-indigo-50 text-indigo-600 p-3">
              <FileEdit size={22} />
            </div>
            <div>
              <p className="text-xs font-black uppercase text-indigo-600">
                Content Studio
              </p>
              <h2 className="text-2xl font-black mt-1">
                Academy Content Authoring
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Draft, review and publish learning content with version awareness.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={createNew}
            className="rounded-xl border px-4 py-2 font-black inline-flex items-center gap-2"
          >
            <Plus size={16} /> New Draft
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-5">
        <div className="bg-white border rounded-3xl p-5">
          <h3 className="font-black">Content Details</h3>

          <label className="block mt-4">
            <span className="text-xs font-black text-slate-600">Title</span>
            <input
              value={draft.title}
              onChange={(e) => update('title', e.target.value)}
              maxLength={160}
              className="mt-2 w-full rounded-xl border px-3 py-3"
              placeholder="Example: Introduction to Fractions"
            />
          </label>

          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <label className="block">
              <span className="text-xs font-black text-slate-600">Content type</span>
              <select
                value={draft.type}
                onChange={(e) => update('type', e.target.value as ContentType)}
                className="mt-2 w-full rounded-xl border px-3 py-3 bg-white"
              >
                <option value="lesson">Lesson</option>
                <option value="material">Material</option>
                <option value="assignment">Assignment</option>
                <option value="test">Test</option>
                <option value="competition">Competition</option>
              </select>
            </label>

            <label className="block">
              <span className="text-xs font-black text-slate-600">Course ID</span>
              <input
                value={draft.courseId}
                onChange={(e) => update('courseId', e.target.value)}
                className="mt-2 w-full rounded-xl border px-3 py-3"
                placeholder="Existing course ID"
              />
            </label>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <label className="block">
              <span className="text-xs font-black text-slate-600">Display order</span>
              <input
                type="number"
                min={0}
                value={draft.order}
                onChange={(e) => update('order', Number(e.target.value))}
                className="mt-2 w-full rounded-xl border px-3 py-3"
              />
            </label>

            <div>
              <span className="text-xs font-black text-slate-600">Version</span>
              <div className="mt-2 rounded-xl bg-slate-50 border px-3 py-3 font-black">
                v{draft.version}
              </div>
            </div>
          </div>

          <label className="block mt-4">
            <span className="text-xs font-black text-slate-600">Description</span>
            <textarea
              value={draft.description}
              onChange={(e) => update('description', e.target.value)}
              maxLength={4000}
              rows={7}
              className="mt-2 w-full rounded-xl border px-3 py-3 resize-y"
              placeholder="Learning objective, lesson summary, instructions or assessment context."
            />
          </label>

          <div className="flex flex-wrap gap-3 mt-5">
            <button
              type="button"
              onClick={saveDraft}
              className="rounded-xl border px-4 py-3 font-black inline-flex items-center gap-2"
            >
              <Save size={16} /> Save Draft
            </button>

            <button
              type="button"
              onClick={sendForReview}
              disabled={!publishable || draft.status === 'published'}
              className="rounded-xl bg-indigo-600 text-white px-4 py-3 font-black inline-flex items-center gap-2 disabled:opacity-40"
            >
              <Send size={16} /> Send for Review
            </button>

            <button
              type="button"
              onClick={publish}
              disabled={!publishable || draft.status !== 'review'}
              className="rounded-xl bg-emerald-600 text-white px-4 py-3 font-black inline-flex items-center gap-2 disabled:opacity-40"
            >
              <CheckCircle2 size={16} /> Publish
            </button>
          </div>

          {saved && (
            <p className="text-xs font-bold text-emerald-700 mt-3">
              Draft state updated locally in this screen.
            </p>
          )}
        </div>

        <div className="space-y-5">
          <div className="bg-white border rounded-3xl p-5">
            <h3 className="font-black">Workflow</h3>
            <div className="space-y-3 mt-4">
              <WorkflowRow label="Draft" active={draft.status === 'draft'} icon={<FileEdit size={16} />} />
              <WorkflowRow label="Review" active={draft.status === 'review'} icon={<Eye size={16} />} />
              <WorkflowRow label="Published" active={draft.status === 'published'} icon={<CheckCircle2 size={16} />} />
              <WorkflowRow label="Archived" active={draft.status === 'archived'} icon={<Lock size={16} />} />
            </div>
          </div>

          <div className="bg-white border rounded-3xl p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-indigo-600" />
              <h3 className="font-black">Validation</h3>
            </div>

            {issues.length === 0 ? (
              <p className="text-sm text-emerald-700 font-bold mt-4">
                Content is structurally ready for review.
              </p>
            ) : (
              <div className="space-y-2 mt-4">
                {issues.map((issue, index) => (
                  <div
                    key={index}
                    className={`rounded-xl p-3 text-xs ${
                      issue.severity === 'error'
                        ? 'bg-rose-50 text-rose-800'
                        : 'bg-amber-50 text-amber-800'
                    }`}
                  >
                    <div className="flex gap-2">
                      <TriangleAlert size={15} className="shrink-0" />
                      <span>{issue.message}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-5">
            <p className="font-black text-indigo-950">Publishing rule</p>
            <p className="text-sm text-indigo-900 mt-1">
              Only content that passes validation and has entered Review can be
              published through this workflow.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function WorkflowRow({
  label,
  active,
  icon,
}: {
  label: ContentStatus;
  active: boolean;
  icon: React.ReactNode;
}) {
  return (
    <div className={`rounded-xl p-3 flex items-center gap-2 ${
      active ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-50 text-slate-500'
    }`}>
      {icon}
      <span className="text-sm font-black capitalize">{label}</span>
    </div>
  );
}
