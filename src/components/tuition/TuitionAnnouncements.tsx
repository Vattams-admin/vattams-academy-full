import { useEffect, useState } from 'react';
import { Megaphone } from 'lucide-react';
import { listAnnouncements } from '@/lib/tuitionCommunications';

export default function TuitionAnnouncements() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    listAnnouncements()
      .then((result) => setItems(result.announcements || []))
      .catch(() => setItems([]));
  }, []);

  if (!items.length) return null;

  return (
    <section className="space-y-3">
      {items.map((item) => (
        <article
          key={item.id}
          className={`rounded-2xl border p-4 ${
            item.priority === 'urgent'
              ? 'border-red-200 bg-red-50'
              : item.priority === 'high'
                ? 'border-amber-200 bg-amber-50'
                : 'bg-white'
          }`}
        >
          <div className="flex gap-3">
            <Megaphone className="text-indigo-600 shrink-0" size={19} />
            <div>
              <p className="font-black">{item.title}</p>
              <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">
                {item.message}
              </p>
              <p className="text-[11px] text-slate-400 mt-2">
                {new Date(item.publish_at).toLocaleString()}
              </p>
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}
