import { FormEvent, useState } from 'react';
import { ArrowLeft, Eye, EyeOff, GraduationCap, LogIn, ShieldCheck } from 'lucide-react';
import { useRouter } from '@/lib/router';
import { loginTutor } from '@/lib/tuitionTutorAuth';

export default function TuitionTutorLogin() {
  const { navigate } = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;
    setLoading(true); setError('');
    try { await loginTutor(email, password); navigate('tuition-tutor-dashboard'); }
    catch (err) { setError(err instanceof Error ? err.message : 'Unable to sign in. Please check your details.'); }
    finally { setLoading(false); }
  };

  return <main className="min-h-screen bg-slate-50 text-slate-900">
    <section className="bg-slate-950 text-white"><div className="max-w-5xl mx-auto px-4 py-12 md:py-16">
      <button type="button" onClick={() => navigate('home')} className="inline-flex items-center gap-2 text-indigo-200 hover:text-white text-sm font-semibold mb-7"><ArrowLeft size={16}/> Back to VATTAMS Academy</button>
      <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center mb-5"><GraduationCap size={28}/></div>
      <p className="text-indigo-300 text-xs font-bold uppercase tracking-[0.18em]">Tutor Portal</p>
      <h1 className="text-3xl md:text-4xl font-black mt-2">Tutor Login</h1>
      <p className="text-slate-300 mt-3 max-w-2xl">Sign in to manage your VATTAMS Academy classes, students and learning activities.</p>
    </div></section>
    <section className="max-w-md mx-auto px-4 py-10"><form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 md:p-8 space-y-5">
      {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      <div><label htmlFor="tutor-email" className="block text-sm font-bold text-slate-700 mb-2">Email</label><input id="tutor-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"/></div>
      <div><label htmlFor="tutor-password" className="block text-sm font-bold text-slate-700 mb-2">Password</label><div className="relative"><input id="tutor-password" type={showPassword ? 'text' : 'password'} required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-12 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"/><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-3 text-slate-400 hover:text-slate-700">{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button></div></div>
      <button disabled={loading} type="submit" className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-3.5 disabled:opacity-50"><LogIn size={18}/> {loading ? 'Signing in…' : 'Sign In'}</button>
      <div className="flex items-start gap-2 text-xs text-slate-500"><ShieldCheck size={15} className="text-green-600 shrink-0 mt-0.5"/> Only approved tutors can access the tutor dashboard.</div>
      <button type="button" onClick={() => navigate('tuition-tutor-register')} className="w-full text-sm font-bold text-indigo-600 hover:text-indigo-700">New tutor? Register here</button>
    </form></section>
  </main>;
}
