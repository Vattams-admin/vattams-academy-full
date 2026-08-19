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

async function hash(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function randomCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}

async function getGuardianSession(token: string) {
  if (!token) return null;

  const tokenHash = await hash(token);

  const { data } = await db
    .from('tuition_guardian_sessions')
    .select('*, tuition_guardians(*)')
    .eq('token_hash', tokenHash)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();

  if (!data || !data.tuition_guardians) return null;

  return {
    ...data,
    guardian: data.tuition_guardians,
  };
}

async function getAdminSession(token: string) {
  if (!token) return null;

  const { data } = await db
    .from('tuition_admin_sessions')
    .select('*')
    .eq('token', token)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();

  return data || null;
}

async function getTutorSession(token: string) {
  if (!token) return null;

  const { data } = await db
    .from('tuition_tutor_sessions')
    .select('*')
    .eq('token', token)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();

  return data || null;
}

async function hasShare(guardianId: string, studentId: string, type: string) {
  const { data } = await db
    .from('tuition_guardian_shares')
    .select('*')
    .eq('guardian_id', guardianId)
    .eq('student_id', studentId)
    .eq('status', 'active')
    .or(`share_type.eq.${type},share_type.eq.all`);

  const valid = (data || []).filter((row: any) =>
    !row.expires_at || new Date(row.expires_at).getTime() > Date.now()
  );

  return valid.length > 0;
}

async function activity(
  guardianId: string,
  action: string,
  studentId?: string,
  metadata: Record<string, unknown> = {},
) {
  await db.from('tuition_guardian_activity_log').insert({
    guardian_id: guardianId,
    action,
    student_id: studentId || null,
    metadata,
  });
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

    if (body.action === 'login') {
      if (!body.guardianId || !body.accessCode) {
        return json({ error: 'Guardian ID and access code are required.' }, 400);
      }

      const codeHash = await hash(String(body.accessCode).trim().toUpperCase());

      const { data: guardian, error } = await db
        .from('tuition_guardians')
        .select('*')
        .eq('id', body.guardianId)
        .eq('status', 'active')
        .eq('access_code_hash', codeHash)
        .maybeSingle();

      if (error) throw error;
      if (!guardian) return json({ error: 'Invalid guardian credentials.' }, 401);

      const rawToken = `${crypto.randomUUID()}-${crypto.randomUUID()}`;
      const tokenHash = await hash(rawToken);

      const expires = new Date();
      expires.setDate(expires.getDate() + 7);

      const { error: sessionError } = await db
        .from('tuition_guardian_sessions')
        .insert({
          guardian_id: guardian.id,
          token_hash: tokenHash,
          expires_at: expires.toISOString(),
        });

      if (sessionError) throw sessionError;

      await db
        .from('tuition_guardians')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', guardian.id);

      await activity(guardian.id, 'login');

      return json({
        success: true,
        token: rawToken,
        guardian: {
          id: guardian.id,
          guardian_name: guardian.guardian_name,
          relationship: guardian.relationship,
        },
      });
    }

    if (body.action === 'createGuardian') {
      const admin = await getAdminSession(token);
      const tutor = await getTutorSession(token);

      if (!admin && !tutor) {
        return json({ error: 'Admin or Tutor access required.' }, 403);
      }

      if (!body.studentId || !body.guardianName || !body.relationship) {
        return json({
          error: 'Student, guardian name and relationship are required.',
        }, 400);
      }

      const rawCode = randomCode();
      const codeHash = await hash(rawCode);

      const { data, error } = await db
        .from('tuition_guardians')
        .insert({
          student_id: body.studentId,
          guardian_name: body.guardianName,
          relationship: body.relationship,
          email: body.email || null,
          mobile: body.mobile || null,
          access_code_hash: codeHash,
          status: 'active',
        })
        .select('id,student_id,guardian_name,relationship,email,mobile,status,created_at')
        .single();

      if (error) throw error;

      const shareTypes = body.shareTypes || ['all'];

      for (const shareType of shareTypes) {
        await db.from('tuition_guardian_shares').insert({
          guardian_id: data.id,
          student_id: body.studentId,
          share_type: shareType,
          granted_by: admin?.id || tutor?.id || null,
        });
      }

      // The access code is returned once to the authorized creator.
      // It is never stored in plaintext.
      return json({
        guardian: data,
        initialAccessCode: rawCode,
      });
    }

    const session = await getGuardianSession(token);
    if (!session) return json({ error: 'Invalid or expired guardian session.' }, 401);

    const guardian = session.guardian;

    if (body.action === 'students') {
      const { data, error } = await db
        .from('tuition_guardian_shares')
        .select('student_id,share_type,status,expires_at')
        .eq('guardian_id', guardian.id)
        .eq('status', 'active');

      if (error) throw error;

      const ids = Array.from(
        new Set(
          (data || [])
            .filter((row: any) =>
              !row.expires_at || new Date(row.expires_at).getTime() > Date.now()
            )
            .map((row: any) => row.student_id),
        ),
      );

      if (!ids.length) return json({ students: [] });

      const { data: students, error: studentError } = await db
        .from('tuition_students')
        .select('id,student_name,email,mobile,status')
        .in('id', ids);

      if (studentError) throw studentError;

      await activity(guardian.id, 'view_students');

      return json({ students: students || [] });
    }

    if (!body.studentId) {
      return json({ error: 'Student ID is required.' }, 400);
    }

    const studentId = body.studentId;

    if (body.action === 'progress') {
      if (!(await hasShare(guardian.id, studentId, 'progress'))) {
        return json({ error: 'Progress sharing is not enabled.' }, 403);
      }

      const [classes, submissions, attempts] = await Promise.all([
        db.from('tuition_class_sessions').select('*').eq('student_id', studentId).order('created_at', { ascending: false }).limit(100),
        db.from('tuition_assignment_submissions').select('*').eq('student_id', studentId).order('created_at', { ascending: false }).limit(100),
        db.from('tuition_test_attempts').select('*').eq('student_id', studentId).order('created_at', { ascending: false }).limit(100),
      ]);

      if (classes.error) throw classes.error;
      if (submissions.error) throw submissions.error;
      if (attempts.error) throw attempts.error;

      await activity(guardian.id, 'view_progress', studentId);

      return json({
        progress: {
          classes: classes.data || [],
          assignments: submissions.data || [],
          tests: attempts.data || [],
        },
      });
    }

    if (body.action === 'attendance') {
      if (!(await hasShare(guardian.id, studentId, 'attendance'))) {
        return json({ error: 'Attendance sharing is not enabled.' }, 403);
      }

      const { data, error } = await db
        .from('tuition_class_attendance')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })
        .limit(200);

      if (error) throw error;

      await activity(guardian.id, 'view_attendance', studentId);
      return json({ attendance: data || [] });
    }

    if (body.action === 'certificates') {
      if (!(await hasShare(guardian.id, studentId, 'certificates'))) {
        return json({ error: 'Certificate sharing is not enabled.' }, 403);
      }

      const { data, error } = await db
        .from('tuition_certificates')
        .select('certificate_number,recipient_name,title,course_name,category,certificate_type,score,percentage,grade,issued_at,status')
        .eq('student_id', studentId)
        .order('issued_at', { ascending: false });

      if (error) throw error;

      await activity(guardian.id, 'view_certificates', studentId);
      return json({ certificates: data || [] });
    }

    if (body.action === 'results') {
      if (!(await hasShare(guardian.id, studentId, 'results'))) {
        return json({ error: 'Result sharing is not enabled.' }, 403);
      }

      const { data, error } = await db
        .from('tuition_test_attempts')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })
        .limit(200);

      if (error) throw error;

      await activity(guardian.id, 'view_results', studentId);
      return json({ results: data || [] });
    }

    if (body.action === 'dashboard') {
      const { data: shares, error: shareError } = await db
        .from('tuition_guardian_shares')
        .select('*')
        .eq('guardian_id', guardian.id)
        .eq('status', 'active');

      if (shareError) throw shareError;

      const students = Array.from(
        new Set(
          (shares || [])
            .filter((row: any) =>
              !row.expires_at || new Date(row.expires_at).getTime() > Date.now()
            )
            .map((row: any) => row.student_id),
        ),
      );

      await activity(guardian.id, 'view_dashboard');

      return json({
        guardian: {
          id: guardian.id,
          guardian_name: guardian.guardian_name,
          relationship: guardian.relationship,
        },
        studentCount: students.length,
        students,
      });
    }

    if (body.action === 'grantShare') {
      const admin = await getAdminSession(token);
      if (!admin) return json({ error: 'Admin access required.' }, 403);

      if (!body.guardianId || !body.studentId || !body.shareType) {
        return json({ error: 'Guardian, student and share type are required.' }, 400);
      }

      const { data, error } = await db
        .from('tuition_guardian_shares')
        .insert({
          guardian_id: body.guardianId,
          student_id: body.studentId,
          share_type: body.shareType,
          granted_by: admin.id,
          expires_at: body.expiresAt || null,
        })
        .select()
        .single();

      if (error) throw error;
      return json({ share: data });
    }

    if (body.action === 'revokeShare') {
      const admin = await getAdminSession(token);
      if (!admin) return json({ error: 'Admin access required.' }, 403);

      const { data, error } = await db
        .from('tuition_guardian_shares')
        .update({
          status: 'revoked',
          revoked_at: new Date().toISOString(),
        })
        .eq('id', body.shareId)
        .select()
        .single();

      if (error) throw error;
      return json({ share: data });
    }

    return json({ error: 'Unknown action.' }, 400);
  } catch (error) {
    console.error('[tuition-guardians]', error);
    return json({
      error: error instanceof Error ? error.message : 'Unexpected error.',
    }, 500);
  }
});
