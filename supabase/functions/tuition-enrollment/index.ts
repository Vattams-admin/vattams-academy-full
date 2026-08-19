import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const db = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

const cors = {
  'Access-Control-Allow-Origin': 'https://vattams.net',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: cors });

async function getSession(token: string) {
  const candidates = [
    ['tuition_admin_sessions', 'admin'],
    ['tuition_tutor_sessions', 'tutor'],
    ['tuition_student_sessions', 'student'],
  ] as const;

  for (const [table, role] of candidates) {
    const { data } = await db
      .from(table)
      .select('*')
      .eq('token', token)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (data) return { ...data, role };
  }
  return null;
}

async function activateVerifiedPayment(payment: any, actorId: string | null) {
  if (!payment?.student_id || !payment?.course_id) {
    return { error: 'A verified course payment must contain student_id and course_id.' };
  }

  const { data: existing } = await db
    .from('tuition_enrollments')
    .select('*')
    .eq('student_id', payment.student_id)
    .eq('course_id', payment.course_id)
    .in('status', ['pending', 'active', 'paused'])
    .maybeSingle();

  if (existing) {
    if (existing.status !== 'active') {
      const { data, error } = await db
        .from('tuition_enrollments')
        .update({
          status: 'active',
          payment_id: payment.id,
          access_start_at: existing.access_start_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;

      await db.from('tuition_payment_access_events').insert([
        {
          payment_id: payment.id,
          enrollment_id: existing.id,
          event_type: 'access_granted',
          actor_id: actorId,
        },
      ]);

      return { enrollment: data };
    }
    return { enrollment: existing };
  }

  const { data, error } = await db
    .from('tuition_enrollments')
    .insert({
      student_id: payment.student_id,
      course_id: payment.course_id,
      payment_id: payment.id,
      status: 'active',
      access_start_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  await db.from('tuition_payment_access_events').insert([
    {
      payment_id: payment.id,
      enrollment_id: data.id,
      event_type: 'access_granted',
      actor_id: actorId,
    },
  ]);

  return { enrollment: data };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors });
  }

  if (req.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);

  try {
    const body = await req.json();
    const token =
      body.token ||
      req.headers.get('Authorization')?.replace(/^Bearer\s+/i, '') ||
      '';

    const user = await getSession(token);
    if (!user) return json({ error: 'Invalid or expired session.' }, 401);

    if (body.action === 'create') {
      if (user.role !== 'student') return json({ error: 'Student access required.' }, 403);

      if (!body.courseId || !body.paymentId) {
        return json({ error: 'Course and payment are required.' }, 400);
      }

      const { data: payment, error: paymentError } = await db
        .from('tuition_payments')
        .select('*')
        .eq('id', body.paymentId)
        .eq('student_id', user.user_id)
        .maybeSingle();

      if (paymentError) throw paymentError;
      if (!payment) return json({ error: 'Payment not found.' }, 404);
      if (payment.course_id !== body.courseId) {
        return json({ error: 'Payment does not match the selected course.' }, 400);
      }

      const initialStatus = payment.status === 'verified' ? 'active' : 'pending';

      const { data, error } = await db
        .from('tuition_enrollments')
        .upsert(
          {
            student_id: user.user_id,
            course_id: body.courseId,
            payment_id: payment.id,
            status: initialStatus,
            access_start_at:
              initialStatus === 'active' ? new Date().toISOString() : null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'student_id,course_id' },
        )
        .select()
        .single();

      if (error) throw error;

      if (initialStatus === 'active') {
        await db.from('tuition_payment_access_events').insert({
          payment_id: payment.id,
          enrollment_id: data.id,
          event_type: 'access_granted',
          actor_id: user.user_id,
        });
      }

      return json({ enrollment: data });
    }

    if (body.action === 'myEnrollments') {
      if (user.role !== 'student') return json({ error: 'Student access required.' }, 403);

      const { data, error } = await db
        .from('tuition_enrollments')
        .select('*')
        .eq('student_id', user.user_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return json({ enrollments: data || [] });
    }

    if (body.action === 'courseAccess') {
      if (user.role !== 'student') return json({ error: 'Student access required.' }, 403);

      const { data, error } = await db
        .from('tuition_enrollments')
        .select('*')
        .eq('student_id', user.user_id)
        .eq('course_id', body.courseId)
        .eq('status', 'active')
        .maybeSingle();

      if (error) throw error;
      return json({ hasAccess: !!data, enrollment: data || null });
    }

    if (body.action === 'adminList') {
      if (user.role !== 'admin') return json({ error: 'Admin access required.' }, 403);

      const { data, error } = await db
        .from('tuition_enrollments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return json({ enrollments: data || [] });
    }

    if (user.role !== 'admin') {
      return json({ error: 'Admin access required.' }, 403);
    }

    if (!body.id) return json({ error: 'Enrollment ID is required.' }, 400);

    const statusMap: Record<string, string> = {
      activate: 'active',
      pause: 'paused',
      complete: 'completed',
      cancel: 'cancelled',
    };

    const nextStatus = statusMap[body.action];
    if (!nextStatus) return json({ error: 'Unknown action.' }, 400);

    const patch: Record<string, unknown> = {
      status: nextStatus,
      updated_at: new Date().toISOString(),
    };

    if (nextStatus === 'active') {
      patch.access_start_at = new Date().toISOString();
    }
    if (nextStatus === 'completed') {
      patch.completed_at = new Date().toISOString();
    }
    if (body.notes !== undefined) patch.notes = body.notes;

    const { data, error } = await db
      .from('tuition_enrollments')
      .update(patch)
      .eq('id', body.id)
      .select()
      .single();

    if (error) throw error;

    await db.from('tuition_payment_access_events').insert({
      payment_id: data.payment_id,
      enrollment_id: data.id,
      event_type:
        nextStatus === 'active' ? 'access_granted' :
        nextStatus === 'cancelled' ? 'access_revoked' :
        'manual_override',
      actor_id: user.user_id,
      notes: body.notes || null,
    });

    return json({ enrollment: data });
  } catch (error) {
    console.error('[tuition-enrollment]', error);
    return json(
      { error: error instanceof Error ? error.message : 'Unexpected error.' },
      500,
    );
  }
});
