import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";
import bcrypt from "npm:bcryptjs@2.4.3";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, serviceKey);
const allowedOrigins = new Set(["https://vattams.net", "https://www.vattams.net", "http://localhost:5173"]);

function corsHeaders(req: Request) {
  const origin = req.headers.get("Origin") ?? "";
  return { "Access-Control-Allow-Origin": allowedOrigins.has(origin) ? origin : "https://vattams.net", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey", "Vary": "Origin" };
}
function json(req: Request, data: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { ...corsHeaders(req), "Content-Type": "application/json", "Cache-Control": "no-store" } });
}
function error(req: Request, message: string, status = 400) { return json(req, { error: message }, status); }
async function sha256(value: string) { const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)); return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join(""); }
function safeStudent(s: Record<string, unknown>) { return { id: s.id, student_id: s.student_id ?? null, student_name: s.student_name, parent_name: s.parent_name, phone: s.phone, email: s.email, city: s.city, course: s.course, class_mode: s.class_mode, status: s.status, preferred_date: s.preferred_date ?? null, preferred_time: s.preferred_time ?? null }; }
async function createSession(studentId: string) {
  const bytes = new Uint8Array(32); crypto.getRandomValues(bytes);
  const token = Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
  const tokenHash = await sha256(token);
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  await supabase.from("tuition_student_sessions").delete().eq("student_id", studentId).lt("expires_at", new Date().toISOString());
  const { error: insertError } = await supabase.from("tuition_student_sessions").insert({ student_id: studentId, token_hash: tokenHash, expires_at: expires });
  if (insertError) throw new Error("Could not create student session.");
  return token;
}
async function getStudentFromToken(token: string) {
  if (!token) return null;
  const tokenHash = await sha256(token);
  const { data: session } = await supabase.from("tuition_student_sessions").select("student_id, expires_at").eq("token_hash", tokenHash).gt("expires_at", new Date().toISOString()).maybeSingle();
  if (!session) return null;
  const { data: student } = await supabase.from("tuition_students").select("id, student_id, student_name, parent_name, phone, email, city, course, class_mode, status, preferred_date, preferred_time").eq("id", session.student_id).maybeSingle();
  if (!student || student.status !== "approved") return null;
  return student;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(req) });
  if (req.method !== "POST") return error(req, "Method not allowed", 405);
  try {
    const body = await req.json();
    const action = body?.action;

    if (action === "register") {
      const studentName = String(body?.studentName ?? "").trim();
      const parentName = String(body?.parentName ?? "").trim();
      const phone = String(body?.phone ?? "").trim();
      const email = String(body?.email ?? "").trim().toLowerCase();
      const city = String(body?.city ?? "").trim();
      const course = String(body?.course ?? "").trim();
      const mode = String(body?.mode ?? "Online One-to-One").trim();
      const password = String(body?.password ?? "");
      if (!studentName || !parentName || !phone || !email || !city || !course || !password) return error(req, "Please complete all required registration fields.");
      if (password.length < 8) return error(req, "Password must be at least 8 characters.");

      const { data: existing } = await supabase.from("tuition_students").select("id").eq("email", email).maybeSingle();
      if (existing) return error(req, "A student registration already exists for this email address.", 409);

      const { data: student, error: studentError } = await supabase.from("tuition_students").insert({ student_name: studentName, parent_name: parentName, phone, email, city, course, class_mode: mode, preferred_date: body?.date || null, preferred_time: body?.time || null, message: String(body?.message ?? "").trim() || null }).select("id, student_id, student_name, parent_name, phone, email, city, course, class_mode, status, preferred_date, preferred_time").single();
      if (studentError || !student) return error(req, studentError?.message || "Could not create student registration.", 500);

      const passwordHash = await bcrypt.hash(password, 10);
      const { error: authError } = await supabase.from("tuition_student_auth").insert({ student_id: student.id, password_hash: passwordHash });
      if (authError) { await supabase.from("tuition_students").delete().eq("id", student.id); return error(req, "Could not create student account.", 500); }
      return json(req, { success: true, student: safeStudent(student) });
    }

    if (action === "login") {
      const email = String(body?.email ?? "").trim().toLowerCase();
      const password = String(body?.password ?? "");
      if (!email || !password) return error(req, "Email and password are required.");
      const { data: student } = await supabase.from("tuition_students").select("id, student_id, student_name, parent_name, phone, email, city, course, class_mode, status, preferred_date, preferred_time").eq("email", email).maybeSingle();
      if (!student) return error(req, "Invalid email or password.", 401);
      if (student.status !== "approved") return error(req, "Your student registration is not approved yet.", 403);
      const { data: auth } = await supabase.from("tuition_student_auth").select("password_hash").eq("student_id", student.id).maybeSingle();
      if (!auth || !(await bcrypt.compare(password, auth.password_hash))) return error(req, "Invalid email or password.", 401);
      const token = await createSession(student.id);
      return json(req, { success: true, token, student: safeStudent(student) });
    }

    if (action === "me") {
      const student = await getStudentFromToken(String(body?.token ?? ""));
      if (!student) return error(req, "Your student session has expired. Please sign in again.", 401);
      return json(req, { success: true, student: safeStudent(student) });
    }

    if (action === "logout") {
      const token = String(body?.token ?? "");
      if (token) await supabase.from("tuition_student_sessions").delete().eq("token_hash", await sha256(token));
      return json(req, { success: true });
    }

    return error(req, "Unknown action.");
  } catch (err) {
    console.error("[tuition-student-auth]", err);
    return error(req, err instanceof Error ? err.message : "Unexpected error.", 500);
  }
});
