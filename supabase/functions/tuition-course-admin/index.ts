import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

function json(data: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
function fail(message: string, status = 400) { return json({ error: message }, status); }

async function requireAdmin(token: string) {
  if (!token) return null;
  const { data: session } = await db.from("admin_sessions").select("admin_id, expires_at").eq("token", token).gt("expires_at", new Date().toISOString()).maybeSingle();
  if (!session) return null;
  const { data: admin } = await db.from("admin_users").select("id, email, role, is_active").eq("id", session.admin_id).maybeSingle();
  if (!admin || admin.is_active !== true || admin.role !== "super_admin") return null;
  return admin;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
  if (req.method !== "POST") return fail("Method not allowed", 405);

  try {
    const body = await req.json();
    const token = (body.token || req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "") || "").trim();
    const admin = await requireAdmin(token);
    if (!admin) return fail("Not authorized", 401);

    const action = body.action;

    if (action === "createCourse") {
      const { data, error } = await db.from("tuition_courses").insert({
        title: body.title, slug: body.slug, short_description: body.shortDescription || null,
        description: body.description || null, category: body.category || "General",
        level: body.level || "All Levels", mode: body.mode || "online",
        course_type: body.courseType || "one-to-one", duration_minutes: body.durationMinutes || null,
        classes_per_week: body.classesPerWeek || null, monthly_price: body.monthlyPrice || null,
        trial_available: body.trialAvailable !== false, is_active: body.isActive !== false,
        display_order: Number(body.displayOrder || 0),
      }).select().single();
      if (error) return fail(error.message, 400);
      return json({ success: true, course: data });
    }

    if (action === "updateCourse") {
      if (!body.slug) return fail("slug is required");
      const patch = { title: body.title, short_description: body.shortDescription ?? null, description: body.description ?? null,
        category: body.category, level: body.level, mode: body.mode, course_type: body.courseType,
        duration_minutes: body.durationMinutes ?? null, classes_per_week: body.classesPerWeek ?? null,
        monthly_price: body.monthlyPrice ?? null, trial_available: body.trialAvailable !== false,
        is_active: body.isActive !== false, display_order: Number(body.displayOrder || 0) };
      const { data, error } = await db.from("tuition_courses").update(patch).eq("slug", body.slug).select().single();
      if (error) return fail(error.message);
      return json({ success: true, course: data });
    }

    if (action === "createLevel") {
      const { data, error } = await db.from("tuition_course_levels").insert({ course_slug: body.courseSlug, level_name: body.levelName, display_order: Number(body.displayOrder || 0), is_active: true }).select().single();
      if (error) return fail(error.message);
      return json({ success: true, level: data });
    }

    if (action === "createModule") {
      const { data, error } = await db.from("tuition_course_modules").insert({ course_slug: body.courseSlug, level_name: body.levelName || null, title: body.title, description: body.description || null, display_order: Number(body.displayOrder || 0), is_published: body.isPublished === true }).select().single();
      if (error) return fail(error.message);
      return json({ success: true, module: data });
    }

    if (action === "createLesson") {
      const { data, error } = await db.from("tuition_course_lessons").insert({ module_id: body.moduleId, title: body.title, description: body.description || null, content: body.content || null, duration_minutes: body.durationMinutes || null, display_order: Number(body.displayOrder || 0), is_published: body.isPublished === true }).select().single();
      if (error) return fail(error.message);
      return json({ success: true, lesson: data });
    }

    if (action === "listContent") {
      const courseSlug = String(body.courseSlug || "");
      if (!courseSlug) return fail("courseSlug is required");
      const [{ data: course }, { data: levels }, { data: modules }] = await Promise.all([
        db.from("tuition_courses").select("*").eq("slug", courseSlug).maybeSingle(),
        db.from("tuition_course_levels").select("*").eq("course_slug", courseSlug).order("display_order"),
        db.from("tuition_course_modules").select("*").eq("course_slug", courseSlug).order("display_order"),
      ]);
      const moduleIds = (modules || []).map((m: any) => m.id);
      const { data: lessons } = moduleIds.length ? await db.from("tuition_course_lessons").select("*").in("module_id", moduleIds).order("display_order") : { data: [] };
      return json({ success: true, course, levels: levels || [], modules: modules || [], lessons: lessons || [] });
    }

    return fail("Unknown action");
  } catch (error) {
    console.error("[tuition-course-admin]", error);
    return fail(error instanceof Error ? error.message : "Unexpected error", 500);
  }
});
