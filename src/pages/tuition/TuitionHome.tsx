import { useRouter } from '@/lib/router';
import { ArrowRight, BookOpen, Calculator, Code2, FlaskConical, GraduationCap, Languages, Mic2, Trophy } from 'lucide-react';

const categories = [
  ['Academic', BookOpen, 'School subjects and board-aligned learning.'],
  ['Vedic Maths & Abacus', Calculator, 'Speed, accuracy, mental maths and foundation skills.'],
  ['Public Speaking & English', Mic2, 'Communication, confidence and language skills.'],
  ['Science & STEM', FlaskConical, 'Science, computer skills and technology learning.'],
  ['Coding & AI', Code2, 'Python, coding, AI fundamentals and digital skills.'],
  ['Competitive Exams', Trophy, 'TNPSC, UPSC, Banking, SSC and entrance preparation.'],
  ['International', Languages, 'IELTS, TOEFL, PTE, SAT and global English preparation.'],
] as const;

export default function TuitionHome() {
  const { navigate } = useRouter();
  return <main className="min-h-screen bg-white text-slate-900">
    <section className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 mb-6"><GraduationCap size={32}/></div>
        <p className="text-indigo-300 font-bold uppercase tracking-[0.2em] text-sm">VATTAMS Academy</p>
        <h1 className="text-4xl md:text-6xl font-black mt-3">Learn. Practice. Achieve.</h1>
        <p className="text-slate-300 text-lg max-w-3xl mx-auto mt-5">Advanced online learning for academics, skills, competitive exams, tutor-led classes and student competitions.</p>
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
          <button onClick={() => navigate('tuition-courses')} className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold">Explore Courses <ArrowRight size={18}/></button>
          <button onClick={() => navigate('tuition-trial-booking')} className="px-6 py-3.5 rounded-xl bg-white/10 border border-white/15 font-bold">Book Trial — ₹150</button>
          <button onClick={() => navigate('tuition-tutor-register')} className="px-6 py-3.5 rounded-xl bg-white/10 border border-white/15 font-bold">Become a Tutor</button>
        </div>
      </div>
    </section>
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <div className="max-w-2xl mb-10"><p className="text-indigo-600 font-bold text-sm uppercase tracking-wider">Learning paths</p><h2 className="text-3xl font-black mt-2">More than tuition</h2><p className="text-slate-600 mt-3">One platform that can grow with the learner from school foundations to advanced skills and competitive preparation.</p></div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">{categories.map(([name, Icon, text]) => <button key={name} onClick={() => navigate('tuition-courses')} className="text-left p-6 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all"><Icon className="text-indigo-600" size={24}/><h3 className="font-extrabold mt-4">{name}</h3><p className="text-sm text-slate-500 mt-2">{text}</p></button>)}</div>
    </section>
  </main>;
}
