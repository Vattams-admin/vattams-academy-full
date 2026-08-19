import { FormEvent, useState } from 'react';
import { Eye, EyeOff, GraduationCap, LogIn } from 'lucide-react';
import { guardianLogin } from '@/lib/tuitionGuardians';

export default function TuitionGuardianLogin({
  onSuccess,
}: {
  onSuccess?: () => void;
}) {
  const [guardianId, setGuardianId] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState('');

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage('');

    try {
      const result = await guardianLogin(guardianId.trim(), accessCode.trim());
      sessionStorage.setItem('vattams_guardian_token', result.token);
      onSuccess?.();
    } catch (error: any) {
      setMessage(error.message || 'Guardian login failed.');
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-5">
      <form onSubmit={submit} className="w-full max-w-md bg-white border rounded-3xl p-6 shadow-sm">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
            <GraduationCap className="text-indigo-600" />
          </div>
          <p className="text-xs font-black uppercase text-indigo-600 mt-4">
            VATTAMS Academy
          </p>
          <h1 className="text-2xl font-black mt-1">Parent / Guardian Login</h1>
          <p className="text-sm text-slate-500 mt-2">
            Use the guardian ID and one-time access code provided by the Academy.
          </p>
        </div>

        <div className="space-y-3 mt-6">
          <input
            value={guardianId}
            onChange={(e) => setGuardianId(e.target.value)}
            placeholder="Guardian ID"
            className="w-full rounded-xl border p-3"
            autoComplete="username"
          />

          <div className="relative">
            <input
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
              placeholder="Access code"
              type={show ? 'text' : 'password'}
              className="w-full rounded-xl border p-3 pr-11 font-bold tracking-widest"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              className="absolute right-2 top-2 rounded-lg p-2"
              aria-label="Show access code"
            >
              {show ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </div>

        {message && (
          <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
            {message}
          </p>
        )}

        <button
          type="submit"
          className="w-full mt-5 rounded-xl bg-indigo-600 px-4 py-3 text-white font-black inline-flex items-center justify-center gap-2"
        >
          <LogIn size={17} />
          Login
        </button>
      </form>
    </div>
  );
}
