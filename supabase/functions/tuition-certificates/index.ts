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

async function sessionFor(token: string) {
  if (!token) return null;

  const tables = [
    ['tuition_student_sessions', 'student'],
    ['tuition_admin_sessions', 'admin'],
  ] as const;

  for (const [table, role] of tables) {
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

function userId(session: any) {
  return session.student_id || session.user_id || session.id;
}

function publicCertificate(certificate: any) {
  return {
    certificate_number: certificate.certificate_number,
    title: certificate.title,
    description: certificate.description,
    certificate_type: certificate.certificate_type,
    issue_date: certificate.issue_date,
    completion_date: certificate.completion_date,
    score: certificate.score,
    percentage: certificate.percentage,
    grade: certificate.grade,
    issuer_name: certificate.issuer_name,
    status: certificate.status,
    verified: certificate.status === 'issued',
  };
}

function makeCertificateNumber() {
  const date = new Date();
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const random = crypto.randomUUID().replaceAll('-', '').slice(0, 8).toUpperCase();
  return `VATTAMS-${y}${m}-${random}`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors });
  }

  try {
    const body = await req.json();

    // Public certificate verification intentionally does not require login.
    if (body.action === 'verify') {
      const verificationToken = String(body.verificationToken || '').trim();

      if (!verificationToken) {
        return json({ error: 'Verification token is required.' }, 400);
      }

      const { data: certificate, error } = await db
        .from('tuition_certificates')
        .select('certificate_number,title,description,certificate_type,issue_date,completion_date,score,percentage,grade,issuer_name,status')
        .eq('verification_token', verificationToken)
        .maybeSingle();

      if (error) throw error;
      if (!certificate) {
        return json({ valid: false, error: 'Certificate not found.' }, 404);
      }

      await db.from('tuition_certificate_events').insert({
        certificate_id: (
          await db.from('tuition_certificates')
            .select('id')
            .eq('verification_token', verificationToken)
            .maybeSingle()
        ).data?.id,
        event_type: certificate.status === 'revoked' ? 'verified' : 'verified',
        metadata: { source: 'public_verification' },
      });

      return json({
        valid: certificate.status === 'issued',
        certificate: publicCertificate(certificate),
      });
    }

    const token =
      body.token ||
      req.headers.get('Authorization')?.replace(/^Bearer\s+/i, '') ||
      '';

    const session = await sessionFor(token);
    if (!session) return json({ error: 'Invalid or expired session.' }, 401);

    if (body.action === 'studentCertificates') {
      if (session.role !== 'student') return json({ error: 'Student access required.' }, 403);

      const { data, error } = await db
        .from('tuition_certificates')
        .select('certificate_number,title,description,certificate_type,issue_date,completion_date,score,percentage,grade,issuer_name,status,verification_token')
        .eq('student_id', userId(session))
        .order('issue_date', { ascending: false });

      if (error) throw error;

      return json({ certificates: data || [] });
    }

    if (body.action === 'create') {
      if (session.role !== 'admin') return json({ error: 'Admin access required.' }, 403);

      if (!body.studentId || !body.title) {
        return json({ error: 'Student and certificate title are required.' }, 400);
      }

      const certificateNumber = makeCertificateNumber();
      const verificationToken = crypto.randomUUID().replaceAll('-', '');

      const { data, error } = await db
        .from('tuition_certificates')
        .insert({
          certificate_number: certificateNumber,
          student_id: body.studentId,
          course_id: body.courseId || null,
          competition_id: body.competitionId || null,
          certificate_type: body.certificateType || 'course',
          title: body.title,
          description: body.description || null,
          issue_date: body.issueDate || new Date().toISOString().slice(0, 10),
          completion_date: body.completionDate || null,
          score: body.score ?? null,
          percentage: body.percentage ?? null,
          grade: body.grade || null,
          issuer_name: 'VATTAMS Academy',
          status: 'issued',
          verification_token: verificationToken,
          created_by: userId(session),
        })
        .select()
        .single();

      if (error) throw error;

      await db.from('tuition_certificate_events').insert({
        certificate_id: data.id,
        event_type: 'issued',
        metadata: { source: 'academy_admin' },
      });

      return json({
        certificate: {
          ...publicCertificate(data),
          verification_token: verificationToken,
          verification_url: `https://vattams.net/#/certificate/verify/${verificationToken}`,
        },
      });
    }

    if (body.action === 'revoke') {
      if (session.role !== 'admin') return json({ error: 'Admin access required.' }, 403);

      const { data, error } = await db
        .from('tuition_certificates')
        .update({
          status: 'revoked',
          updated_at: new Date().toISOString(),
        })
        .eq('id', body.certificateId)
        .select()
        .single();

      if (error) throw error;
      if (!data) return json({ error: 'Certificate not found.' }, 404);

      await db.from('tuition_certificate_events').insert({
        certificate_id: data.id,
        event_type: 'revoked',
        metadata: { source: 'academy_admin' },
      });

      return json({ certificate: publicCertificate(data) });
    }

    return json({ error: 'Unknown action.' }, 400);
  } catch (error) {
    console.error('[tuition-certificates]', error);
    return json({
      error: error instanceof Error ? error.message : 'Unexpected error.',
    }, 500);
  }
});
