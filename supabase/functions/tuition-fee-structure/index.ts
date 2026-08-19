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

    // Public catalogue reads are allowed without a session. Admin writes are not.
    if (body.action === 'fees') {
      const { data, error } = await db
        .from('tuition_fee_structures')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return json({ fees: data || [] });
    }

    if (body.action === 'payoutRules') {
      if (!user || !['admin', 'tutor'].includes(user.role)) {
        return json({ error: 'Tutor/Admin access required.' }, 403);
      }

      const { data, error } = await db
        .from('tuition_tutor_payout_rules')
        .select('*')
        .eq('is_active', true)
        .order('tutor_percentage', { ascending: true });

      if (error) throw error;
      return json({ rules: data || [] });
    }

    if (body.action === 'joiningFee') {
      const { data, error } = await db
        .from('tuition_tutor_joining_fee_settings')
        .select('fee_amount,currency,fee_name,description,refund_policy')
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return json({ joiningFee: data });
    }

    if (!user || user.role !== 'admin') {
      return json({ error: 'Admin access required.' }, 403);
    }

    if (body.action === 'adminCreateFee') {
      const fee = Number(body.studentFee);
      if (!Number.isFinite(fee) || fee < 0) {
        return json({ error: 'Invalid student fee.' }, 400);
      }

      const { data, error } = await db
        .from('tuition_fee_structures')
        .insert({
          name: body.name,
          category: body.category || 'Academic',
          level: body.level || null,
          delivery_mode: body.deliveryMode || 'one_to_one',
          duration_minutes: Number(body.durationMinutes || 60),
          sessions_per_package: body.sessionsPerPackage || null,
          student_fee: fee,
          currency: 'INR',
          sort_order: Number(body.sortOrder || 0),
          is_active: body.isActive !== false,
        })
        .select()
        .single();

      if (error) throw error;
      return json({ fee: data });
    }

    if (body.action === 'adminUpdateFee') {
      const patch: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      for (const key of [
        'name',
        'category',
        'level',
        'delivery_mode',
        'duration_minutes',
        'sessions_per_package',
        'student_fee',
        'sort_order',
        'is_active',
      ]) {
        if (body[key] !== undefined) patch[key] = body[key];
      }

      if (patch.student_fee !== undefined) {
        const fee = Number(patch.student_fee);
        if (!Number.isFinite(fee) || fee < 0) {
          return json({ error: 'Invalid student fee.' }, 400);
        }
        patch.student_fee = fee;
      }

      const { data, error } = await db
        .from('tuition_fee_structures')
        .update(patch)
        .eq('id', body.id)
        .select()
        .single();

      if (error) throw error;
      return json({ fee: data });
    }

    if (body.action === 'adminUpdatePayoutRule') {
      const patch: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      for (const key of [
        'name',
        'tutor_tier',
        'payout_model',
        'tutor_percentage',
        'fixed_session_amount',
        'min_session_amount',
        'max_session_amount',
        'category',
        'is_active',
      ]) {
        if (body[key] !== undefined) patch[key] = body[key];
      }

      const { data, error } = await db
        .from('tuition_tutor_payout_rules')
        .update(patch)
        .eq('id', body.id)
        .select()
        .single();

      if (error) throw error;
      return json({ rule: data });
    }

    return json({ error: 'Unknown action.' }, 400);
  } catch (error) {
    console.error('[tuition-fee-structure]', error);
    return json(
      { error: error instanceof Error ? error.message : 'Unexpected error.' },
      500,
    );
  }
});
