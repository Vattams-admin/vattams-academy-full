import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";
import { PDFDocument, StandardFonts, rgb, degrees } from "npm:pdf-lib@1.17.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const db = createClient(supabaseUrl, serviceRoleKey);

const ORIGINALS_BUCKET = "tuition-materials-originals";
const PROTECTED_BUCKET = "tuition-materials-protected";
const VALID_CATEGORIES = new Set([
  "courseMaterials", "studyMaterials", "worksheets", "questionBanks",
  "testPapers", "mockExams", "solutions", "revisionMaterials", "examPreparation",
]);

function json(data: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
function fail(message: string, status = 400) { return json({ error: message }, status); }

async function requireAdmin(token: string) {
  if (!token) return null;
  const { data: session } = await db
    .from("admin_sessions")
    .select("admin_id, expires_at")
    .eq("token", token)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();
  if (!session) return null;
  const { data: admin } = await db
    .from("admin_users")
    .select("id, email, role, is_active")
    .eq("id", session.admin_id)
    .maybeSingle();
  if (!admin || admin.is_active !== true || admin.role !== "super_admin") return null;
  return admin;
}

function base64ToBytes(base64: string): Uint8Array {
  const cleaned = base64.includes(",") ? base64.split(",").pop()! : base64;
  const binary = atob(cleaned);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function watermarkPdf(originalBytes: Uint8Array): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(originalBytes);
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontSize = 26;
  const tileSpacingX = 190;
  const tileSpacingY = 140;
  const opacity = 0.12;

  for (const page of pdfDoc.getPages()) {
    const { width, height } = page.getSize();
    const diagonal = Math.sqrt(width * width + height * height);
    for (let y = -diagonal; y < diagonal; y += tileSpacingY) {
      for (let x = -diagonal; x < diagonal; x += tileSpacingX) {
        page.drawText("VATTAMS", {
          x, y, size: fontSize, font,
          color: rgb(0.5, 0.5, 0.5), opacity,
          rotate: degrees(45),
        });
      }
    }
  }
  return pdfDoc.save();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
  if (req.method !== "POST") return fail("Method not allowed", 405);

  try {
    const body = await req.json();
    const token = String(body.token || req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "") || "").trim();
    const admin = await requireAdmin(token);
    if (!admin) return fail("Not authorized", 401);

    const action = String(body.action || "");

    if (action === "list") {
      let query = db.from("tuition_course_materials").select("*").order("created_at", { ascending: false });
      if (body.courseSlug) query = query.eq("course_slug", String(body.courseSlug));
      const { data, error } = await query;
      if (error) return fail(error.message, 400);
      return json({ success: true, materials: data || [] });
    }

    if (action === "setPublished") {
      const { data, error } = await db.from("tuition_course_materials")
        .update({ is_published: body.isPublished === true })
        .eq("id", String(body.id)).select().single();
      if (error) return fail(error.message, 400);
      return json({ success: true, material: data });
    }

    if (action === "delete") {
      const id = String(body.id || "");
      if (!id) return fail("id is required");
      const { data: material } = await db.from("tuition_course_materials").select("id, resource_url").eq("id", id).maybeSingle();
      if (!material) return fail("Material not found", 404);
      const { error } = await db.from("tuition_course_materials").delete().eq("id", id);
      if (error) return fail(error.message, 400);
      return json({ success: true });
    }

    if (action === "createExternal") {
      const courseSlug = String(body.courseSlug || "").trim();
      const title = String(body.title || "").trim();
      const externalUrl = String(body.externalUrl || "").trim();
      const category = String(body.category || "");
      if (!courseSlug || !title || !externalUrl || !/^https?:\/\//i.test(externalUrl)) return fail("Valid courseSlug, title and http(s) externalUrl are required.");
      if (!VALID_CATEGORIES.has(category)) return fail("Invalid material category.");
      const { data: course } = await db.from("tuition_courses").select("slug").eq("slug", courseSlug).maybeSingle();
      if (!course) return fail("Course not found", 404);
      const { data, error } = await db.from("tuition_course_materials").insert({
        course_slug: courseSlug, title, description: body.description || null, category,
        subject: body.subject || null, topic: body.topic || null, grade: body.grade || null,
        resource_url: null, external_url: externalUrl, file_type: "link", file_size: null,
        is_published: body.isPublished === true,
      }).select().single();
      if (error) return fail(error.message, 400);
      return json({ success: true, material: data });
    }

    if (action === "uploadPdf") {
      const courseSlug = String(body.courseSlug || "").trim();
      const title = String(body.title || "").trim();
      const category = String(body.category || "");
      const fileBase64 = String(body.fileBase64 || "");
      const fileName = String(body.fileName || "material.pdf");
      if (!courseSlug || !title || !fileBase64) return fail("courseSlug, title and fileBase64 are required.");
      if (!VALID_CATEGORIES.has(category)) return fail("Invalid material category.");

      const { data: course } = await db.from("tuition_courses").select("slug").eq("slug", courseSlug).maybeSingle();
      if (!course) return fail("Course not found", 404);

      let originalBytes: Uint8Array;
      try { originalBytes = base64ToBytes(fileBase64); } catch { return fail("Invalid base64 PDF."); }
      if (originalBytes.length > 50 * 1024 * 1024) return fail("PDF must be 50 MB or smaller.");

      const safeFile = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
      const id = crypto.randomUUID();
      const stamp = Date.now();
      const originalPath = `${courseSlug}/${category}/${stamp}-${id}-original-${safeFile}`;
      const protectedPath = `${courseSlug}/${category}/${stamp}-${id}-protected-${safeFile}`;

      const originalUpload = await db.storage.from(ORIGINALS_BUCKET).upload(originalPath, originalBytes, { contentType: "application/pdf", upsert: false });
      if (originalUpload.error) return fail(`Failed to store original PDF: ${originalUpload.error.message}`, 500);

      const protectedBytes = await watermarkPdf(originalBytes);
      const protectedUpload = await db.storage.from(PROTECTED_BUCKET).upload(protectedPath, protectedBytes, { contentType: "application/pdf", upsert: false });
      if (protectedUpload.error) return fail(`Failed to store protected PDF: ${protectedUpload.error.message}`, 500);

      const { data: urlData } = db.storage.from(PROTECTED_BUCKET).getPublicUrl(protectedPath);
      const { data, error } = await db.from("tuition_course_materials").insert({
        course_slug: courseSlug, title,
        description: body.description || null, category,
        subject: body.subject || null, topic: body.topic || null, grade: body.grade || null,
        resource_url: urlData.publicUrl, external_url: null, file_type: "pdf",
        file_size: protectedBytes.byteLength, is_published: body.isPublished === true,
      }).select().single();
      if (error) return fail(error.message, 400);

      return json({ success: true, material: data });
    }

    return fail("Unknown action", 400);
  } catch (error) {
    console.error("[tuition-material-admin]", error);
    return fail(error instanceof Error ? error.message : "Unexpected error", 500);
  }
});
