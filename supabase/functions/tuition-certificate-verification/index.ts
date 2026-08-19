import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const db = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

const cors = {
  'Access-Control-Allow-Origin': '*',
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

function makeCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}

async function adminSession(token: string) {
  if (!token) return null;

  const { data } = await db
    .from('tuition_admin_sessions')
    .select('*')
    .eq('token', token)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();

  return data;
}

async function getCertificate(certificateId: string) {
  const { data, error } = await db
    .from('tuition_certificates')
    .select('*')
    .eq('id', certificateId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function publicCertificate(number: string, code?: string) {
  let query = db
    .from('tuition_certificate_verifications')
    .select('certificate_number,verification_code,status,issued_at,revoked_at,revoked_reason,certificate_id')
    .eq('certificate_number', number.trim())
    .maybeSingle();

  const { data: verification, error } = await query;
  if (error) throw error;
  if (!verification) return null;

  if (code) {
    const incoming = await hash(code.trim().toUpperCase());
    const stored = await hash(verification.verification_code);
    // The DB stores a non-secret verification token. We still avoid returning it
    // to the public response and only use a matching code when supplied.
    if (incoming !== stored && code.trim().toUpperCase() !== verification.verification_code) {
      return null;
    }
  }

  const certificate = await getCertificate(verification.certificate_id);
  if (!certificate) return null;

  return {
    valid: verification.status === 'active' && !verification.revoked_at,
    certificateNumber: verification.certificate_number,
    status: verification.status,
    issuedAt: verification.issued_at,
    revokedAt: verification.revoked_at,
    revokedReason: verification.revoked_reason,
    recipientName: certificate.recipient_name || certificate.student_name || null,
    title: certificate.title || null,
    courseName: certificate.course_name || certificate.course_title || null,
    category: certificate.category || null,
    certificateType: certificate.certificate_type || null,
    score: certificate.score ?? null,
    percentage: certificate.percentage ?? null,
    grade: certificate.grade ?? null,
  };
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

    if (body.action === 'verify') {
      if (!body.certificateNumber) {
        return json({ error: 'Certificate number is required.' }, 400);
      }

      const result = await publicCertificate(
        String(body.certificateNumber),
        body.verificationCode ? String(body.verificationCode) : undefined,
      );

      if (!result) {
        return json({
          valid: false,
          message: 'Certificate could not be verified.',
        });
      }

      return json(result);
    }

    const admin = await adminSession(token);
    if (!admin) return json({ error: 'Admin access required.' }, 403);

    if (body.action === 'create') {
      if (!body.certificateId) {
        return json({ error: 'Certificate ID is required.' }, 400);
      }

      const certificate = await getCertificate(body.certificateId);
      if (!certificate) return json({ error: 'Certificate not found.' }, 404);

      const certificateNumber =
        certificate.certificate_number ||
        certificate.certificateNumber;

      if (!certificateNumber) {
        return json({ error: 'Certificate number is missing.' }, 400);
      }

      const existing = await db
        .from('tuition_certificate_verifications')
        .select('*')
        .eq('certificate_id', body.certificateId)
        .maybeSingle();

      if (existing.data) {
        return json({
          verification: {
            id: existing.data.id,
            certificateNumber: existing.data.certificate_number,
            verificationCode: existing.data.verification_code,
            status: existing.data.status,
          },
        });
      }

      const verificationCode = makeCode();

      const { data, error } = await db
        .from('tuition_certificate_verifications')
        .insert({
          certificate_id: body.certificateId,
          certificate_number: certificateNumber,
          verification_code: verificationCode,
          status: 'active',
          issued_at: certificate.issued_at || new Date().toISOString(),
        })
        .select('id,certificate_number,verification_code,status,issued_at')
        .single();

      if (error) throw error;

      return json({
        verification: {
          id: data.id,
          certificateNumber: data.certificate_number,
          verificationCode: data.verification_code,
          status: data.status,
          issuedAt: data.issued_at,
        },
      });
    }

    if (body.action === 'revoke') {
      if (!body.verificationId) {
        return json({ error: 'Verification ID is required.' }, 400);
      }

      const { data, error } = await db
        .from('tuition_certificate_verifications')
        .update({
          status: 'revoked',
          revoked_at: new Date().toISOString(),
          revoked_reason: body.reason || 'Revoked by Academy administration.',
          updated_at: new Date().toISOString(),
        })
        .eq('id', body.verificationId)
        .select('id,certificate_number,status,revoked_at,revoked_reason')
        .single();

      if (error) throw error;
      return json({ verification: data });
    }

    return json({ error: 'Unknown action.' }, 400);
  } catch (error) {
    console.error('[tuition-certificate-verification]', error);
    return json({
      error: error instanceof Error ? error.message : 'Unexpected error.',
    }, 500);
  }
});
