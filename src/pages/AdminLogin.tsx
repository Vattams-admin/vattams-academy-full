import { useState } from 'react';
import { Lock, Loader, AlertCircle, Mail, ShieldCheck } from 'lucide-react';
import { useRouter } from '@/lib/router';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/lib/supabase';

const ADMIN_AUTH_URL = `${SUPABASE_URL}/functions/v1/admin-auth`;

export default function AdminLogin() {
  const { navigate } = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail || !password.trim()) {
        setError('Please enter your email and password.');
        return;
      }

      const response = await fetch(ADMIN_AUTH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          apikey: SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ email: cleanEmail, password }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.sessionToken) {
        setError(result.error || 'Invalid admin email or password.');
        return;
      }

      sessionStorage.setItem('vattams_admin_token', result.sessionToken);
      sessionStorage.setItem('vattams_admin', result.adminId || '');
      sessionStorage.setItem('vattams_admin_email', result.email || cleanEmail);
      sessionStorage.setItem('vattams_admin_expires', result.expiresAt || '');
      sessionStorage.setItem('vattams_admin_role', result.role || 'super_admin');
      sessionStorage.setItem('vattams_admin_name', result.fullName || 'Academy Admin');

      navigate('admin-dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-20 md:pt-24 min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <img src="/vattams-academy-logo.svg" alt="VATTAMS Academy" className="h-20 w-auto mx-auto mb-4 rounded-xl" />
            <h1 className="text-2xl font-extrabold text-white mb-1">Admin Login</h1>
            <p className="text-blue-200 text-sm">Secure access to VATTAMS Academy Administration</p>
          </div>

          {error && <div className="mb-5 rounded-2xl border border-red-300/30 bg-red-500/10 p-4 text-sm text-red-100 flex gap-2"><AlertCircle size={18} className="shrink-0" />{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="admin-email" className="block text-sm font-bold text-blue-50 mb-2">Email</label>
              <div className="relative"><Mail className="absolute left-3 top-3.5 text-blue-200" size={18}/><input id="admin-email" type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-white/20 bg-white/10 text-white placeholder:text-blue-200 pl-10 pr-4 py-3.5 outline-none focus:ring-2 focus:ring-blue-300" placeholder="admin@example.com"/></div>
            </div>
            <div>
              <label htmlFor="admin-password" className="block text-sm font-bold text-blue-50 mb-2">Password</label>
              <div className="relative"><Lock className="absolute left-3 top-3.5 text-blue-200" size={18}/><input id="admin-password" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-white/20 bg-white/10 text-white placeholder:text-blue-200 pl-10 pr-4 py-3.5 outline-none focus:ring-2 focus:ring-blue-300" placeholder="Your password"/></div>
            </div>
            <button disabled={loading} type="submit" className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-white text-blue-950 font-extrabold py-3.5 disabled:opacity-60 hover:bg-blue-50">
              {loading ? <Loader size={18} className="animate-spin"/> : <ShieldCheck size={18}/>} {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
