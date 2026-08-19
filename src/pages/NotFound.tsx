import { Home as HomeIcon, ArrowRight } from 'lucide-react';
import { useRouter } from '@/lib/router';

export default function NotFound() {
  const { navigate } = useRouter();
  return (
    <main className="min-h-[70vh] flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md text-center">
        <div className="text-7xl font-black text-indigo-600">404</div>
        <h1 className="text-2xl font-black text-slate-900 mt-3">Learning page not found</h1>
        <p className="text-slate-500 mt-3">The page may have moved. Return to VATTAMS Academy and continue learning.</p>
        <button onClick={() => navigate('home')} className="mt-7 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 text-white font-bold"><HomeIcon size={17} /> Academy Home <ArrowRight size={16} /></button>
      </div>
    </main>
  );
}
