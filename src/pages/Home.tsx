import { useSEO } from '@/lib/seo';
import { useRouter } from '@/lib/router';
import { ArrowRight, BookOpen, Brain, Code2, Languages, Medal, Sparkles, Trophy, Users, Video, Calculator, Mic2 } from 'lucide-react';

const categories = [
  { name: 'Academic', text: 'Mathematics, Science, Languages and school subjects.', icon: BookOpen },
  { name: 'Foundation', text: 'Vedic Maths, Abacus, Aptitude, Reasoning and Olympiad skills.', icon: Calculator },
  { name: 'Communication', text: 'Public Speaking, Spoken English and confidence building.', icon: Mic2 },
  { name: 'Technology', text: 'Coding, Python, AI, digital and future-ready skills.', icon: Code2 },
  { name: 'Competitive Exams', text: 'TNPSC, UPSC, Banking, SSC and entrance preparation.', icon: Brain },
  { name: 'International', text: 'IELTS, TOEFL, PTE, SAT and global English preparation.', icon: Languages },
];

const features = [
  ['Expert Tutors', 'Structured tutor registration, verification and approval.', Users],
  ['Live Online Learning', 'Classes, trial sessions, materials and attendance.', Video],
  ['Practice & Assessments', 'Assignments, tests, mock exams and progress tracking.', Brain],
  ['Competitions', 'Academic, skills and competitive learning challenges.', Trophy],
  ['Achievements', 'Professional certificates and QR-based verification.', Medal],
  ['One Learning Platform', 'Students, tutors and tuition administration in one ecosystem.', Sparkles],
] as const;

export default function Home() {
  const { navigate } = useRouter();

  useSEO({
    title: 'VATTAMS Academy | Online Learning Platform',
    description: 'VATTAMS Academy is an online learning platform for academic education, skills, competitive exams, competitions and certificates.',
    path: '/',
  });

  return (
    <main className="bg-white text-slate-900">
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(99,102,241,.28),transparent_35%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-indigo-200 text-xs font-bold uppercase tracking-[0.18em] mb-6">
              <Sparkles size={14} /> Advanced Online Education
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight leading-[1.03]">
              VATTAMS <span className="text-indigo-400">Academy</span>
            </h1>
            <p className="mt-5 text-xl sm:text-2xl text-slate-200 font-semibold">Learn. Practice. Achieve.</p>
            <p className="mt-6 max-w-2xl text-base sm:text-lg text-slate-300 leading-relaxed">
              One modern learning platform for academic subjects, future skills, competitive exams, tutor-led classes and student competitions.
            </p>
            <div className="mt-9 flex flex-col sm:flex-row gap-3">
              <button onClick={() => navigate('tuition-courses')} className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
                Explore Courses <ArrowRight size={18} />
              </button>
              <button onClick={() => navigate('tuition-booking')} className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold">
                Register as Student
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 border-b border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            ['Academic', 'Learning'], ['Skills', 'Future-ready'], ['Exams', 'Competitive'], ['Contests', 'Achievements'],
          ].map(([a, b]) => <div key={a} className="rounded-2xl border border-slate-100 p-4 text-center"><div className="font-extrabold text-slate-900">{a}</div><div className="text-xs text-slate-500 mt-1">{b}</div></div>)}
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-10"><p className="text-indigo-600 font-bold text-sm uppercase tracking-wider">Explore learning</p><h2 className="text-3xl md:text-4xl font-black mt-2">A wider world of education</h2><p className="text-slate-600 mt-3">The platform is designed to grow from online tuition into a complete learning ecosystem.</p></div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map((item) => { const Icon = item.icon; return <button key={item.name} onClick={() => navigate('tuition-courses')} className="text-left p-6 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all bg-white"><div className="h-11 w-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center"><Icon size={21} /></div><h3 className="font-extrabold text-lg mt-5">{item.name}</h3><p className="text-sm text-slate-500 mt-2 leading-relaxed">{item.text}</p></button>; })}
          </div>
        </div>
      </section>

      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10"><p className="text-indigo-600 font-bold text-sm uppercase tracking-wider">One ecosystem</p><h2 className="text-3xl md:text-4xl font-black mt-2">Everything around the learner</h2></div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(([title, text, Icon]) => <div key={title} className="bg-white rounded-2xl border border-slate-200 p-6"><Icon size={22} className="text-indigo-600" /><h3 className="font-extrabold mt-4">{title}</h3><p className="text-sm text-slate-500 mt-2 leading-relaxed">{text}</p></div>)}
          </div>
        </div>
      </section>

      <section className="py-20 bg-indigo-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-black">Ready to start learning?</h2>
          <p className="mt-4 text-indigo-100">Choose a course, meet the right tutor and build measurable learning progress.</p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
            <button onClick={() => navigate('tuition-courses')} className="px-6 py-3.5 rounded-xl bg-white text-indigo-700 font-extrabold">View Courses</button>
            <button onClick={() => navigate('tuition-tutor-register')} className="px-6 py-3.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 border border-white/20 font-extrabold">Become a Tutor</button>
          </div>
        </div>
      </section>
    </main>
  );
}
