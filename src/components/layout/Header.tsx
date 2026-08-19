import { useState } from 'react';
import { Menu, X, GraduationCap, UserRound, ChevronRight } from 'lucide-react';
import { useRouter } from '@/lib/router';

const links = [
  { label: 'Home', page: 'home' as const },
  { label: 'Courses', page: 'tuition-courses' as const },
  { label: 'Tutor', page: 'tuition-tutor-register' as const },
  { label: 'Student', page: 'tuition-booking' as const },
  { label: 'Competitions', page: 'academy-competitions' as const },
  { label: 'Certificates', page: 'academy-certificates' as const },
];

export default function Header() {
  const { navigate } = useRouter();
  const [open, setOpen] = useState(false);

  const go = (page: typeof links[number]['page']) => {
    setOpen(false);
    navigate(page);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <button onClick={() => go('home')} className="flex items-center gap-3 min-w-0" aria-label="VATTAMS Academy home">
          <div className="h-10 w-10 rounded-xl bg-slate-950 flex items-center justify-center overflow-hidden shrink-0">
            <img src="/vattams-academy-mark.svg" alt="VATTAMS" className="h-9 w-9 object-contain" />
          </div>
          <div className="text-left leading-tight">
            <div className="font-extrabold tracking-tight text-slate-950">VATTAMS</div>
            <div className="text-[10px] font-bold tracking-[0.22em] uppercase text-indigo-600">Academy</div>
          </div>
        </button>

        <nav className="hidden lg:flex items-center gap-1" aria-label="Primary navigation">
          {links.map((link) => (
            <button
              key={link.label}
              onClick={() => go(link.page)}
              className="px-3 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:text-indigo-700 hover:bg-indigo-50 transition-colors"
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={() => { setOpen(false); navigate('admin-login'); }}
            className="px-3 py-2 text-sm font-semibold text-slate-600 hover:text-indigo-700"
          >
            Admin
          </button>
          <button
            onClick={() => go('tuition-booking')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-sm"
          >
            <GraduationCap size={16} />
            Join as Student
          </button>
        </div>

        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={() => go('tuition-booking')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm font-bold"
          >
            <UserRound size={15} /> Student
          </button>
          <button
            onClick={() => setOpen((value) => !value)}
            className="p-2 rounded-lg text-slate-700 hover:bg-slate-100"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X size={23} /> : <Menu size={23} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-slate-100 bg-white shadow-lg">
          <nav className="px-4 py-3 space-y-1">
            {links.map((link) => (
              <button
                key={link.label}
                onClick={() => go(link.page)}
                className="w-full flex items-center justify-between px-3 py-3 rounded-xl text-left text-sm font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700"
              >
                {link.label}
                <ChevronRight size={16} />
              </button>
            ))}
            <button
              onClick={() => { setOpen(false); navigate('admin-login'); }}
              className="w-full flex items-center justify-between px-3 py-3 rounded-xl text-left text-sm font-semibold text-slate-700 hover:bg-indigo-50"
            >
              Tuition Admin
              <ChevronRight size={16} />
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
