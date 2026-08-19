import { useEffect, useState } from 'react';
import { BookOpenCheck, CheckCircle2, Clock3, LockKeyhole } from 'lucide-react';
import {
  createEnrollment,
  getCourseAccess,
  listMyEnrollments,
} from '@/lib/tuitionEnrollment';

type Props = {
  courseId: string;
  courseName?: string;
  paymentId?: string;
};

export default function TuitionStudentEnrollment({
  courseId,
  courseName,
  paymentId,
}: Props) {
  const [access, setAccess] = useState(false);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [message, setMessage] = useState('');

  const load = async () => {
    try {
      const result = await getCourseAccess(courseId);
      setAccess(!!result.hasAccess);
      setEnrollment(result.enrollment || null);
    } catch (e: any) {
      setMessage(e.message || 'Unable to check course access.');
    }
  };

  useEffect(() => {
    load();
  }, [courseId]);

  const enroll = async () => {
    if (!paymentId) {
      setMessage('Complete the course payment first.');
      return;
    }

    try {
      const result = await createEnrollment({
        courseId,
        paymentId,
      });
      setEnrollment(result.enrollment);
      setAccess(result.enrollment?.status === 'active');
      setMessage(
        result.enrollment?.status === 'active'
          ? 'Enrollment active. Course access is now available.'
          : 'Enrollment request saved. Access will activate after payment verification.',
      );
    } catch (e: any) {
      setMessage(e.message || 'Unable to create enrollment.');
    }
  };

  if (access) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="text-emerald-600" />
          <div>
            <p className="font-black">Course Access Active</p>
            <p className="text-sm text-emerald-800">
              {courseName || 'This course'} is available in your Academy classroom.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const pending = enrollment?.status === 'pending';

  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="flex items-center gap-3">
        {pending ? (
          <Clock3 className="text-amber-600" />
        ) : (
          <LockKeyhole className="text-slate-500" />
        )}
        <div>
          <p className="font-black">
            {pending ? 'Payment Verification Pending' : 'Course Access Locked'}
          </p>
          <p className="text-sm text-slate-500">
            {pending
              ? 'Your enrollment is waiting for payment verification.'
              : 'Verified payment is required before course access is activated.'}
          </p>
        </div>
      </div>

      {!pending && (
        <button
          type="button"
          onClick={enroll}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-white font-black"
        >
          <BookOpenCheck size={17} />
          Enroll in {courseName || 'Course'}
        </button>
      )}

      {message && (
        <p className="mt-3 rounded-xl bg-indigo-50 p-3 text-sm font-semibold text-indigo-800">
          {message}
        </p>
      )}
    </div>
  );
}

export function TuitionStudentEnrollmentList() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    listMyEnrollments()
      .then((result) => setItems(result.enrollments || []))
      .catch(() => setItems([]));
  }, []);

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.id} className="rounded-2xl border bg-white p-4">
          <p className="font-black">Course ID: {item.course_id}</p>
          <p className="text-xs text-slate-500 mt-1">
            Status: {item.status}
          </p>
        </div>
      ))}
      {!items.length && (
        <p className="text-sm text-slate-400">No enrollments yet.</p>
      )}
    </div>
  );
}
