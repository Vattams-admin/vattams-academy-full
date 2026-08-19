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

    if (body.action === 'settings') {
      const { data, error } = await db
        .from('tuition_payment_settings')
        .select('display_name,upi_id,account_name,bank_name,account_number_last4,ifsc,payment_instructions,support_message')
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return json({ settings: data });
    }

    if (body.action === 'create') {
      if (user.role !== 'student') {
        return json({ error: 'Student access required.' }, 403);
      }

      const amount = Number(body.amount);
      if (!Number.isFinite(amount) || amount <= 0) {
        return json({ error: 'A valid payment amount is required.' }, 400);
      }

      const { data, error } = await db
        .from('tuition_payments')
        .insert({
          student_id: user.user_id,
          course_id: body.courseId || null,
          enrollment_id: body.enrollmentId || null,
          payment_type: body.paymentType || 'course_fee',
          amount,
          currency: 'INR',
          payment_method: body.paymentMethod || 'upi',
          status: 'pending',
          notes: body.notes || null,
        })
        .select()
        .single();

      if (error) throw error;
      return json({ payment: data });
    }

    if (body.action === 'submitProof') {
      if (user.role !== 'student') {
        return json({ error: 'Student access required.' }, 403);
      }

      if (!body.paymentId || !body.utrNumber) {
        return json({ error: 'Payment ID and UTR number are required.' }, 400);
      }

      const utr = String(body.utrNumber).trim();
      if (utr.length < 4 || utr.length > 100) {
        return json({ error: 'Please enter a valid UTR/transaction reference.' }, 400);
      }

      const { data, error } = await db
        .from('tuition_payments')
        .update({
          utr_number: utr,
          transaction_reference: body.transactionReference || utr,
          proof_url: body.proofUrl || null,
          status: 'submitted',
          paid_at: body.paidAt || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', body.paymentId)
        .eq('student_id', user.user_id)
        .eq('status', 'pending')
        .select()
        .single();

      if (error) throw error;
      return json({ payment: data });
    }

    if (body.action === 'myPayments') {
      if (user.role !== 'student') {
        return json({ error: 'Student access required.' }, 403);
      }

      const { data, error } = await db
        .from('tuition_payments')
        .select('*')
        .eq('student_id', user.user_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return json({ payments: data || [] });
    }

    if (body.action === 'adminList') {
      if (user.role !== 'admin') {
        return json({ error: 'Admin access required.' }, 403);
      }

      const { data, error } = await db
        .from('tuition_payments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return json({ payments: data || [] });
    }

    if (body.action === 'verify') {
      if (user.role !== 'admin') {
        return json({ error: 'Admin access required.' }, 403);
      }

      if (!['verified', 'rejected'].includes(body.status)) {
        return json({ error: 'Invalid verification status.' }, 400);
      }

      const { data, error } = await db
        .from('tuition_payments')
        .update({
          status: body.status,
          notes: body.notes || null,
          verified_by: user.user_id,
          verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', body.id)
        .in('status', ['submitted', 'pending'])
        .select()
        .single();

      if (error) throw error;
      return json({ payment: data });
    }

    return json({ error: 'Unknown action.' }, 400);
  } catch (error) {
    console.error('[tuition-payments]', error);
    return json(
      { error: error instanceof Error ? error.message : 'Unexpected server error.' },
      500,
    );
  }
});
