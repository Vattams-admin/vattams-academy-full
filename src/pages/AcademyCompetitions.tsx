import { Trophy, Medal, Brain, Calculator, Mic2, Code2 } from 'lucide-react';
import { useSEO } from '@/lib/seo';

const items = [
  ['Vedic Maths Challenge', Calculator], ['Mathematics Olympiad', Brain], ['Science & GK Quiz', Trophy], ['Public Speaking Contest', Mic2], ['Coding & AI Challenge', Code2], ['Creative & Academic Competitions', Medal],
] as const;

export default function AcademyCompetitions() {
  useSEO({ title: 'Competitions | VATTAMS Academy', description: 'VATTAMS Academy competitions and challenges for students.', path: '/#academy-competitions' });
  return <main className="min-h-[70vh] bg-slate-50 py-14"><div className="max-w-6xl mx-auto px-4"><div className="max-w-2xl mb-10"><p className="text-indigo-600 font-bold uppercase tracking-wider text-sm">VATTAMS Academy</p><h1 className="text-4xl font-black mt-2">Competitions & Challenges</h1><p className="text-slate-600 mt-3">A dedicated competition ecosystem for knowledge, skills, speed, creativity and confidence.</p></div><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">{items.map(([name, Icon]) => <div key={name} className="bg-white border border-slate-200 rounded-2xl p-6"><Icon className="text-indigo-600" size={25}/><h2 className="font-extrabold mt-4">{name}</h2><p className="text-sm text-slate-500 mt-2">Competition framework — coming soon.</p></div>)}</div></div></main>;
}
