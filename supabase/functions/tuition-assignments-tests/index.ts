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
    ['tuition_tutor_sessions', 'tutor'],
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
  return session.student_id || session.tutor_id || session.user_id || session.id;
}

async function tutorOwnsAssignment(tutorId: string, assignmentId: string) {
  const { data } = await db
    .from('tuition_assignments')
    .select('*')
    .eq('id', assignmentId)
    .eq('tutor_id', tutorId)
    .maybeSingle();
  return data;
}

async function tutorOwnsTest(tutorId: string, testId: string) {
  const { data } = await db
    .from('tuition_tests')
    .select('*')
    .eq('id', testId)
    .eq('tutor_id', tutorId)
    .maybeSingle();
  return data;
}

async function studentHasAssignment(studentId: string, assignmentId: string) {
  const { data: assignment } = await db
    .from('tuition_assignments')
    .select('id,course_id')
    .eq('id', assignmentId)
    .eq('is_published', true)
    .maybeSingle();

  if (!assignment) return false;

  // Existing student-course enrollment schemas vary. If an enrollment table
  // is present, use it; otherwise the published assignment remains visible.
  try {
    const { data } = await db
      .from('tuition_student_courses')
      .select('student_id')
      .eq('student_id', studentId)
      .eq('course_id', assignment.course_id)
      .maybeSingle();
    return !!data;
  } catch {
    return true;
  }
}

async function testAvailable(test: any) {
  if (!test.is_published || test.status !== 'published') return false;
  const now = Date.now();
  if (test.starts_at && now < new Date(test.starts_at).getTime()) return false;
  if (test.ends_at && now > new Date(test.ends_at).getTime()) return false;
  return true;
}

async function attemptCount(studentId: string, testId: string) {
  const { count } = await db
    .from('tuition_test_attempts')
    .select('*', { count: 'exact', head: true })
    .eq('student_id', studentId)
    .eq('test_id', testId);
  return count || 0;
}

async function gradeTest(testId: string, answers: Record<string, unknown>) {
  const { data: questions, error } = await db
    .from('tuition_test_questions')
    .select('id,question_type,correct_answer,marks')
    .eq('test_id', testId)
    .order('question_order', { ascending: true });

  if (error) throw error;

  let score = 0;
  let max = 0;

  for (const q of questions || []) {
    const marks = Number(q.marks || 0);
    max += marks;

    if (q.question_type === 'short_answer') continue;

    const supplied = answers?.[q.id];
    const expected = String(q.correct_answer ?? '').trim().toLowerCase();
    const actual = String(supplied ?? '').trim().toLowerCase();

    if (expected && actual === expected) score += marks;
  }

  const percentage = max ? (score / max) * 100 : 0;
  return {
    score: Number(score.toFixed(2)),
    percentage: Number(percentage.toFixed(2)),
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

    const session = await sessionFor(token);
    if (!session) return json({ error: 'Invalid or expired session.' }, 401);

    if (body.action === 'studentAssignments') {
      if (session.role !== 'student') return json({ error: 'Student access required.' }, 403);

      const studentId = userId(session);
      const { data, error } = await db
        .from('tuition_assignments')
        .select('*')
        .eq('is_published', true)
        .order('due_at', { ascending: true, nullsFirst: false });

      if (error) throw error;

      const ids = (data || []).map((a: any) => a.id);
      let submissions: any[] = [];

      if (ids.length) {
        const { data: submitted } = await db
          .from('tuition_assignment_submissions')
          .select('*')
          .eq('student_id', studentId)
          .in('assignment_id', ids);
        submissions = submitted || [];
      }

      return json({ assignments: data || [], submissions });
    }

    if (body.action === 'submitAssignment') {
      if (session.role !== 'student') return json({ error: 'Student access required.' }, 403);

      const studentId = userId(session);
      if (!await studentHasAssignment(studentId, body.assignmentId)) {
        return json({ error: 'Assignment is not available for your account.' }, 403);
      }

      const { data: assignment } = await db
        .from('tuition_assignments')
        .select('id,status,due_at')
        .eq('id', body.assignmentId)
        .maybeSingle();

      if (!assignment) return json({ error: 'Assignment not found.' }, 404);
      if (assignment.status === 'closed') return json({ error: 'This assignment is closed.' }, 409);

      const { data, error } = await db
        .from('tuition_assignment_submissions')
        .upsert({
          assignment_id: body.assignmentId,
          student_id: studentId,
          submission_text: body.submissionText || null,
          submission_url: body.submissionUrl || null,
          status: 'submitted',
          submitted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'assignment_id,student_id' })
        .select()
        .single();

      if (error) throw error;
      return json({ submission: data });
    }

    if (body.action === 'studentTests') {
      if (session.role !== 'student') return json({ error: 'Student access required.' }, 403);

      const studentId = userId(session);
      const { data, error } = await db
        .from('tuition_tests')
        .select('id,course_id,title,description,duration_minutes,max_attempts,pass_percentage,status,is_published,starts_at,ends_at')
        .eq('is_published', true)
        .order('starts_at', { ascending: true, nullsFirst: true });

      if (error) throw error;

      const tests = (data || []).filter(testAvailable);
      const testIds = tests.map((t: any) => t.id);
      let attempts: any[] = [];

      if (testIds.length) {
        const { data: a } = await db
          .from('tuition_test_attempts')
          .select('id,test_id,attempt_number,score,percentage,status,started_at,submitted_at')
          .eq('student_id', studentId)
          .in('test_id', testIds)
          .order('created_at', { ascending: false });
        attempts = a || [];
      }

      return json({ tests, attempts });
    }

    if (body.action === 'studentTest') {
      if (session.role !== 'student') return json({ error: 'Student access required.' }, 403);

      const { data: test, error } = await db
        .from('tuition_tests')
        .select('id,course_id,title,description,duration_minutes,max_attempts,pass_percentage,status,is_published,starts_at,ends_at')
        .eq('id', body.testId)
        .maybeSingle();

      if (error) throw error;
      if (!test || !testAvailable(test)) return json({ error: 'Test is not available.' }, 404);

      const { data: questions, error: qError } = await db
        .from('tuition_test_questions')
        .select('id,question_order,question_text,question_type,options,marks,explanation')
        .eq('test_id', body.testId)
        .order('question_order', { ascending: true });

      if (qError) throw qError;

      return json({ test, questions: questions || [] });
    }

    if (body.action === 'startTest') {
      if (session.role !== 'student') return json({ error: 'Student access required.' }, 403);

      const studentId = userId(session);
      const { data: test } = await db
        .from('tuition_tests')
        .select('*')
        .eq('id', body.testId)
        .maybeSingle();

      if (!test || !testAvailable(test)) return json({ error: 'Test is not available.' }, 404);

      const count = await attemptCount(studentId, body.testId);
      if (count >= Number(test.max_attempts || 1)) {
        return json({ error: 'Maximum attempts reached for this test.' }, 409);
      }

      const attemptNumber = count + 1;

      const { data, error } = await db
        .from('tuition_test_attempts')
        .insert({
          test_id: body.testId,
          student_id: studentId,
          attempt_number: attemptNumber,
          status: 'in_progress',
          answers: {},
          started_at: new Date().toISOString(),
        })
        .select('id,test_id,attempt_number,started_at')
        .single();

      if (error) throw error;
      return json({ attempt: data });
    }

    if (body.action === 'submitTest') {
      if (session.role !== 'student') return json({ error: 'Student access required.' }, 403);

      const studentId = userId(session);

      const { data: attempt, error: attemptError } = await db
        .from('tuition_test_attempts')
        .select('*')
        .eq('id', body.attemptId)
        .eq('student_id', studentId)
        .maybeSingle();

      if (attemptError) throw attemptError;
      if (!attempt) return json({ error: 'Test attempt not found.' }, 404);
      if (attempt.status !== 'in_progress') return json({ error: 'This attempt is already submitted.' }, 409);

      const { data: test } = await db
        .from('tuition_tests')
        .select('id,pass_percentage')
        .eq('id', attempt.test_id)
        .maybeSingle();

      if (!test) return json({ error: 'Test not found.' }, 404);

      const answers = body.answers || {};
      const graded = await gradeTest(attempt.test_id, answers);
      const passed = graded.percentage >= Number(test.pass_percentage || 40);
      const submittedAt = new Date();
      const startedAt = new Date(attempt.started_at);
      const durationSeconds = Math.max(0, Math.round((submittedAt.getTime() - startedAt.getTime()) / 1000));

      const { data: updated, error: updateError } = await db
        .from('tuition_test_attempts')
        .update({
          answers,
          score: graded.score,
          percentage: graded.percentage,
          status: passed ? 'passed' : 'failed',
          submitted_at: submittedAt.toISOString(),
          duration_seconds: durationSeconds,
        })
        .eq('id', attempt.id)
        .select()
        .single();

      if (updateError) throw updateError;

      await db.from('tuition_test_results').upsert({
        attempt_id: attempt.id,
        test_id: attempt.test_id,
        student_id: studentId,
        score: graded.score,
        percentage: graded.percentage,
        result_status: passed ? 'passed' : 'failed',
      }, { onConflict: 'attempt_id' });

      return json({ attempt: updated, passed });
    }

    if (body.action === 'tutorAssignments') {
      if (session.role !== 'tutor') return json({ error: 'Tutor access required.' }, 403);

      const tutorId = userId(session);
      const { data, error } = await db
        .from('tuition_assignments')
        .select('*')
        .eq('tutor_id', tutorId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return json({ assignments: data || [] });
    }

    if (body.action === 'createAssignment') {
      if (session.role !== 'tutor') return json({ error: 'Tutor access required.' }, 403);

      const tutorId = userId(session);
      if (!body.title) return json({ error: 'Assignment title is required.' }, 400);

      const { data, error } = await db
        .from('tuition_assignments')
        .insert({
          course_id: body.courseId || null,
          classroom_session_id: body.classroomSessionId || null,
          tutor_id: tutorId,
          title: body.title,
          description: body.description || null,
          instructions: body.instructions || null,
          due_at: body.dueAt || null,
          max_score: Number(body.maxScore || 100),
          status: body.isPublished ? 'published' : 'draft',
          is_published: !!body.isPublished,
        })
        .select()
        .single();

      if (error) throw error;
      return json({ assignment: data });
    }

    if (body.action === 'reviewAssignment') {
      if (session.role !== 'tutor') return json({ error: 'Tutor access required.' }, 403);

      const tutorId = userId(session);
      const assignment = await tutorOwnsAssignment(tutorId, body.assignmentId);
      if (!assignment) return json({ error: 'Assignment not found.' }, 404);

      const { data, error } = await db
        .from('tuition_assignment_submissions')
        .update({
          score: body.score,
          feedback: body.feedback || null,
          status: 'reviewed',
          reviewed_at: new Date().toISOString(),
          reviewed_by: tutorId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', body.submissionId)
        .eq('assignment_id', body.assignmentId)
        .select()
        .single();

      if (error) throw error;
      return json({ submission: data });
    }

    if (body.action === 'tutorTests') {
      if (session.role !== 'tutor') return json({ error: 'Tutor access required.' }, 403);

      const tutorId = userId(session);
      const { data, error } = await db
        .from('tuition_tests')
        .select('*')
        .eq('tutor_id', tutorId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return json({ tests: data || [] });
    }

    if (body.action === 'createTest') {
      if (session.role !== 'tutor') return json({ error: 'Tutor access required.' }, 403);

      const tutorId = userId(session);
      if (!body.title) return json({ error: 'Test title is required.' }, 400);

      const { data, error } = await db
        .from('tuition_tests')
        .insert({
          course_id: body.courseId || null,
          tutor_id: tutorId,
          title: body.title,
          description: body.description || null,
          duration_minutes: Number(body.durationMinutes || 30),
          max_attempts: Number(body.maxAttempts || 1),
          pass_percentage: Number(body.passPercentage || 40),
          status: body.isPublished ? 'published' : 'draft',
          is_published: !!body.isPublished,
          starts_at: body.startsAt || null,
          ends_at: body.endsAt || null,
        })
        .select()
        .single();

      if (error) throw error;
      return json({ test: data });
    }

    if (body.action === 'addTestQuestion') {
      if (session.role !== 'tutor') return json({ error: 'Tutor access required.' }, 403);

      const tutorId = userId(session);
      if (!await tutorOwnsTest(tutorId, body.testId)) {
        return json({ error: 'Test not found.' }, 404);
      }

      if (!body.questionText) return json({ error: 'Question text is required.' }, 400);

      const { data, error } = await db
        .from('tuition_test_questions')
        .insert({
          test_id: body.testId,
          question_order: Number(body.questionOrder || 1),
          question_text: body.questionText,
          question_type: body.questionType || 'mcq',
          options: body.options || [],
          correct_answer: body.correctAnswer || null,
          marks: Number(body.marks || 1),
          explanation: body.explanation || null,
        })
        .select()
        .single();

      if (error) throw error;
      return json({ question: data });
    }

    return json({ error: 'Unknown action.' }, 400);
  } catch (error) {
    console.error('[tuition-assignments-tests]', error);
    return json({
      error: error instanceof Error ? error.message : 'Unexpected error.',
    }, 500);
  }
});
