import { Mail, MessageCircle, Phone, ShieldCheck, Trophy, BookOpen, UserPlus, GraduationCap } from 'lucide-react';
import { useRouter } from '@/lib/router';
import SocialLinks from '@/components/SocialLinks';

export default function Footer() {
  const { navigate } = useRouter();

  return (
    <footer className="bg-slate-950 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="sm:col-span-2 lg:col-span-1">
            <button onClick={() => navigate('home')} className="flex items-center gap-3 mb-4">
              <div className="h-11 w-11 rounded-xl bg-white/10 flex items-center justify-center overflow-hidden">
                <img src="/vattams-academy-mark.svg" alt="VATTAMS Academy" className="h-10 w-10 object-contain" />
              </div>
              <div className="text-left">
                <div className="text-white font-extrabold">VATTAMS</div>
                <div className="text-indigo-300 text-xs font-bold tracking-[0.18em] uppercase">Academy</div>
              </div>
            </button>
            <p className="text-indigo-300 text-sm font-semibold italic mb-3">Learn. Practice. Achieve.</p>
            <p className="text-slate-400 text-sm leading-relaxed">
              A modern online learning platform for academic education, skills, competitive exams and student competitions.
            </p>
            <SocialLinks variant="footer" />
          </div>

          <div>
            <h3 className="text-white font-bold mb-4">Academy</h3>
            <div className="space-y-2 text-sm">
              <button onClick={() => navigate('tuition-courses')} className="block hover:text-white">Courses</button>
              <button onClick={() => navigate('tuition-tutor-register')} className="block hover:text-white">Become a Tutor</button>
              <button onClick={() => navigate('tuition-booking')} className="block hover:text-white">Student Registration</button>
              <button onClick={() => navigate('academy-competitions')} className="block hover:text-white">Competitions</button>
              <button onClick={() => navigate('academy-certificates')} className="block hover:text-white">Certificates</button>
            </div>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4">Learning</h3>
            <div className="space-y-3 text-sm text-slate-400">
              <div className="flex gap-2"><BookOpen size={16} className="text-indigo-400 shrink-0" /> Academic & foundation courses</div>
              <div className="flex gap-2"><GraduationCap size={16} className="text-indigo-400 shrink-0" /> Expert tutor-led learning</div>
              <div className="flex gap-2"><Trophy size={16} className="text-indigo-400 shrink-0" /> Competitions & assessments</div>
              <div className="flex gap-2"><ShieldCheck size={16} className="text-indigo-400 shrink-0" /> Verified certificates</div>
            </div>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4">Contact</h3>
            <div className="space-y-3 text-sm">
              <a href="tel:+916374068296" className="flex items-center gap-3 hover:text-white"><Phone size={16} className="text-indigo-400" /> +91 63740 68296</a>
              <a href="https://wa.me/918189800757" target="_blank" rel="noreferrer" className="flex items-center gap-3 hover:text-white"><MessageCircle size={16} className="text-green-400" /> WhatsApp Support</a>
              <a href="mailto:admin@vattams.net" className="flex items-center gap-3 hover:text-white"><Mail size={16} className="text-indigo-400" /> admin@vattams.net</a>
              <button onClick={() => navigate('tuition-tutor-register')} className="mt-2 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"><UserPlus size={16} /> Tutor Registration</button>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row justify-between gap-3 text-xs text-slate-500">
          <span>© 2026 VATTAMS Academy. All rights reserved.</span>
          <span>Learn. Practice. Achieve.</span>
        </div>
      </div>
    </footer>
  );
}
