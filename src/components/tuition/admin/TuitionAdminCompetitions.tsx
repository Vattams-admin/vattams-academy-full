import { useEffect, useState } from 'react';
import { Plus, Trophy } from 'lucide-react';
import { createCompetition, getAdminCompetitions } from '@/lib/tuitionCompetitions';

export default function TuitionAdminCompetitions() {
  const [competitions, setCompetitions] = useState<any[]>([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Mathematics',
    competitionType: 'quiz',
    startsAt: '',
    endsAt: '',
    durationMinutes: 30,
    maxParticipants: '',
    courseId: '',
  });
  const [message, setMessage] = useState('');

  const load = async () => {
    try {
      const result = await getAdminCompetitions();
      setCompetitions(result.competitions || []);
    } catch (error: any) {
      setMessage(error.message || 'Unable to load competitions.');
    }
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    try {
      await createCompetition({
        ...form,
        startsAt: new Date(form.startsAt).toISOString(),
        endsAt: new Date(form.endsAt).toISOString(),
        durationMinutes: Number(form.durationMinutes || 30),
        maxParticipants: form.maxParticipants ? Number(form.maxParticipants) : null,
        isPublished: true,
      });
      setMessage('Competition published.');
      await load();
    } catch (error: any) {
      setMessage(error.message || 'Unable to create competition.');
    }
  };

  return (
    <section className="space-y-5">
      <div className="bg-white border rounded-3xl p-5">
        <div className="flex items-center gap-2">
          <Trophy className="text-amber-500" />
          <div>
            <p className="text-xs font-black uppercase text-indigo-600">Academy Admin</p>
            <h2 className="text-xl font-black">Competitions</h2>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-3 mt-5">
          <input value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} placeholder="Competition title" className="rounded-xl border p-3" />
          <input value={form.category} onChange={(e) => setForm({...form, category: e.target.value})} placeholder="Category" className="rounded-xl border p-3" />
          <textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} placeholder="Description" className="rounded-xl border p-3" />
          <select value={form.competitionType} onChange={(e) => setForm({...form, competitionType: e.target.value})} className="rounded-xl border p-3">
            <option value="quiz">Quiz</option>
            <option value="mock_test">Mock Test</option>
            <option value="challenge">Challenge</option>
            <option value="creative">Creative</option>
            <option value="speaking">Speaking</option>
            <option value="coding">Coding</option>
          </select>
          <input type="datetime-local" value={form.startsAt} onChange={(e) => setForm({...form, startsAt: e.target.value})} className="rounded-xl border p-3" />
          <input type="datetime-local" value={form.endsAt} onChange={(e) => setForm({...form, endsAt: e.target.value})} className="rounded-xl border p-3" />
          <input type="number" value={form.durationMinutes} onChange={(e) => setForm({...form, durationMinutes: Number(e.target.value)})} placeholder="Duration" className="rounded-xl border p-3" />
          <input value={form.maxParticipants} onChange={(e) => setForm({...form, maxParticipants: e.target.value})} placeholder="Max participants (optional)" className="rounded-xl border p-3" />
        </div>

        <button type="button" onClick={create} className="mt-4 rounded-xl bg-indigo-600 text-white px-5 py-3 font-black inline-flex items-center gap-2">
          <Plus size={16} /> Publish Competition
        </button>
        {message && <p className="mt-4 rounded-xl bg-indigo-50 p-3 text-sm text-indigo-800">{message}</p>}
      </div>

      <div className="bg-white border rounded-3xl p-5">
        <h3 className="font-black">Competition Schedule</h3>
        <div className="grid md:grid-cols-2 gap-3 mt-4">
          {competitions.map((item) => (
            <div key={item.id} className="rounded-2xl border p-4">
              <p className="font-black">{item.title}</p>
              <p className="text-xs text-indigo-600 font-bold mt-1">{item.category}</p>
              <p className="text-xs text-slate-500 mt-2">
                {new Date(item.starts_at).toLocaleString()} → {new Date(item.ends_at).toLocaleString()}
              </p>
              <span className="inline-block mt-2 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black uppercase">{item.status}</span>
            </div>
          ))}
          {!competitions.length && <p className="text-sm text-slate-400 py-6">No competitions created yet.</p>}
        </div>
      </div>
    </section>
  );
}
