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

async function activeEnrollment(studentId: string, courseId: string) {
  const { data, error } = await db
    .from('tuition_enrollments')
    .select('*')
    .eq('student_id', studentId)
    .eq('course_id', courseId)
    .eq('status', 'active')
    .maybeSingle();

  if (error) throw error;
  return data;
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

    if (body.action === 'createAssignment') {
      if (!['admin', 'tutor'].includes(user.role)) {
        return json({ error: 'Tutor/Admin access required.' }, 403);
      }
      if (!body.courseId || !body.title) {
        return json({ error: 'Course and title are required.' }, 400);
      }

      const { data, error } = await db
        .from('tuition_assignments')
        .insert({
          course_id: body.courseId,
          title: body.title,
          description: body.description || null,
          instructions: body.instructions || null,
          due_at: body.dueAt || null,
          max_score: Number(body.maxScore || 100),
          status: body.status || 'draft',
          created_by: user.user_id,
        })
        .select()
        .single();

      if (error) throw error;
      return json({ assignment: data });
    }

    if (body.action === 'listAssignments') {
      const { data, error } = await db
        .from('tuition_assignments')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (user.role !== 'student') {
        return json({ assignments: data || [] });
      }

      const filtered: any[] = [];
      for (const item of data || []) {
        const enrollment = await activeEnrollment(user.user_id, item.course_id);
        if (enrollment) filtered.push(item);
      }
      return json({ assignments: filtered });
    }

    if (body.action === 'submitAssignment') {
      if (user.role !== 'student') {
        return json({ error: 'Student access required.' }, 403);
      }

      const { data: assignment, error } = await db
        .from('tuition_assignments')
        .select('*')
        .eq('id', body.assignmentId)
        .eq('status', 'published')
        .maybeSingle();

      if (error) throw error;
      if (!assignment) return json({ error: 'Assignment not found.' }, 404);

      const enrollment = await activeEnrollment(user.user_id, assignment.course_id);
      if (!enrollment) return json({ error: 'Active course enrollment required.' }, 403);

      const late =
        assignment.due_at &&
        new Date().getTime() > new Date(assignment.due_at).getTime();

      const { data, error: submissionError } = await db
        .from('tuition_assignment_submissions')
        .upsert(
          {
            assignment_id: assignment.id,
            student_id: user.user_id,
            submission_text: body.submissionText || null,
            file_url: body.fileUrl || null,
            submitted_at: new Date().toISOString(),
            status: late ? 'late' : 'submitted',
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'assignment_id,student_id' },
        )
        .select()
        .single();

      if (submissionError) throw submissionError;
      return json({ submission: data });
    }

    if (body.action === 'reviewAssignment') {
      if (!['admin', 'tutor'].includes(user.role)) {
        return json({ error: 'Tutor/Admin access required.' }, 403);
      }

      const score = Number(body.score);
      if (!Number.isFinite(score) || score < 0) {
        return json({ error: 'Valid score is required.' }, 400);
      }

      const { data, error } = await db
        .from('tuition_assignment_submissions')
        .update({
          score,
          tutor_feedback: body.feedback || null,
          status: 'reviewed',
          reviewed_by: user.user_id,
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', body.submissionId)
        .select()
        .single();

      if (error) throw error;
      return json({ submission: data });
    }

    if (body.action === 'createTest') {
      if (!['admin', 'tutor'].includes(user.role)) {
        return json({ error: 'Tutor/Admin access required.' }, 403);
      }
      if (!body.courseId || !body.title) {
        return json({ error: 'Course and title are required.' }, 400);
      }

      const { data, error } = await db
        .from('tuition_tests')
        .insert({
          course_id: body.courseId,
          title: body.title,
          description: body.description || null,
          duration_minutes: Number(body.durationMinutes || 30),
          max_attempts: Number(body.maxAttempts || 1),
          pass_percentage: Number(body.passPercentage ?? 40),
          status: body.status || 'draft',
          shuffle_questions: body.shuffleQuestions !== false,
          show_result_immediately: body.showResultImmediately !== false,
          created_by: user.user_id,
        })
        .select()
        .single();

      if (error) throw error;
      return json({ test: data });
    }

    if (body.action === 'addTestQuestion') {
      if (!['admin', 'tutor'].includes(user.role)) {
        return json({ error: 'Tutor/Admin access required.' }, 403);
      }

      const { data: test, error: testError } = await db
        .from('tuition_tests')
        .select('*')
        .eq('id', body.testId)
        .maybeSingle();

      if (testError) throw testError;
      if (!test) return json({ error: 'Test not found.' }, 404);

      const { data, error } = await db
        .from('tuition_test_questions')
        .insert({
          test_id: test.id,
          question_text: body.questionText,
          question_type: body.questionType || 'mcq',
          options: body.options || null,
          correct_answer: body.correctAnswer || null,
          marks: Number(body.marks || 1),
          sort_order: Number(body.sortOrder || 0),
          explanation: body.explanation || null,
        })
        .select()
        .single();

      if (error) throw error;
      return json({ question: data });
    }

    if (body.action === 'listTests') {
      const { data, error } = await db
        .from('tuition_tests')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (user.role !== 'student') return json({ tests: data || [] });

      const filtered: any[] = [];
      for (const item of data || []) {
        if (await activeEnrollment(user.user_id, item.course_id)) filtered.push(item);
      }
      return json({ tests: filtered });
    }

    if (body.action === 'startTest') {
      if (user.role !== 'student') {
        return json({ error: 'Student access required.' }, 403);
      }

      const { data: test, error: testError } = await db
        .from('tuition_tests')
        .select('*')
        .eq('id', body.testId)
        .eq('status', 'published')
        .maybeSingle();

      if (testError) throw testError;
      if (!test) return json({ error: 'Test not found.' }, 404);

      if (!(await activeEnrollment(user.user_id, test.course_id))) {
        return json({ error: 'Active course enrollment required.' }, 403);
      }

      const { count } = await db
        .from('tuition_test_attempts')
        .select('*', { count: 'exact', head: true })
        .eq('test_id', test.id)
        .eq('student_id', user.user_id);

      if ((count || 0) >= test.max_attempts) {
        return json({ error: 'Maximum attempts reached.' }, 400);
      }

      const attemptNumber = (count || 0) + 1;

      const { data: questions, error: questionError } = await db
        .from('tuition_test_questions')
        .select('id,question_text,question_type,options,marks,sort_order')
        .eq('test_id', test.id)
        .order('sort_order');

      if (questionError) throw questionError;

      const maxScore = (questions || []).reduce(
        (sum: number, q: any) => sum + Number(q.marks || 0),
        0,
      );

      const { data: attempt, error: attemptError } = await db
        .from('tuition_test_attempts')
        .insert({
          test_id: test.id,
          student_id: user.user_id,
          attempt_number: attemptNumber,
          max_score: maxScore,
          status: 'in_progress',
        })
        .select()
        .single();

      if (attemptError) throw attemptError;

      return json({
        attempt,
        test: {
          id: test.id,
          title: test.title,
          durationMinutes: test.duration_minutes,
          passPercentage: test.pass_percentage,
        },
        questions: questions || [],
      });
    }

    if (body.action === 'submitTest') {
      if (user.role !== 'student') {
        return json({ error: 'Student access required.' }, 403);
      }

      const { data: attempt, error: attemptError } = await db
        .from('tuition_test_attempts')
        .select('*')
        .eq('id', body.attemptId)
        .eq('student_id', user.user_id)
        .eq('status', 'in_progress')
        .maybeSingle();

      if (attemptError) throw attemptError;
      if (!attempt) return json({ error: 'Active test attempt not found.' }, 404);

      const { data: test, error: testError } = await db
        .from('tuition_tests')
        .select('*')
        .eq('id', attempt.test_id)
        .maybeSingle();

      if (testError) throw testError;
      if (!test) return json({ error: 'Test not found.' }, 404);

      if (!(await activeEnrollment(user.user_id, test.course_id))) {
        return json({ error: 'Active course enrollment required.' }, 403);
      }

      const started = new Date(attempt.started_at).getTime();
      const elapsedMinutes = (Date.now() - started) / 60000;
      if (elapsedMinutes > test.duration_minutes + 1) {
        await db
          .from('tuition_test_attempts')
          .update({
            status: 'expired',
            submitted_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', attempt.id);
        return json({ error: 'Test time expired.' }, 400);
      }

      const { data: questions, error: questionError } = await db
        .from('tuition_test_questions')
        .select('*')
        .eq('test_id', test.id);

      if (questionError) throw questionError;

      const answers = Array.isArray(body.answers) ? body.answers : [];
      const answerMap = new Map(
        answers.map((a: any) => [String(a.questionId), a.answerText ?? '']),
      );

      let score = 0;
      let maxScore = 0;
      const rows: any[] = [];

      for (const question of questions || []) {
        const marks = Number(question.marks || 0);
        maxScore += marks;

        const raw = String(answerMap.get(String(question.id)) ?? '').trim();
        const correct = question.correct_answer == null
          ? null
          : String(question.correct_answer).trim();

        let isCorrect: boolean | null = null;
        let awarded = 0;

        if (['mcq', 'true_false'].includes(question.question_type) && correct != null) {
          isCorrect = raw.toLowerCase() === correct.toLowerCase();
          awarded = isCorrect ? marks : 0;
          score += awarded;
        }

        rows.push({
          attempt_id: attempt.id,
          question_id: question.id,
          answer_text: raw,
          awarded_marks: awarded,
          is_correct: isCorrect,
          updated_at: new Date().toISOString(),
        });
      }

      await db.from('tuition_test_answers').upsert(rows, {
        onConflict: 'attempt_id,question_id',
      });

      const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
      const passed = percentage >= Number(test.pass_percentage);

      const { data: updated, error: updateError } = await db
        .from('tuition_test_attempts')
        .update({
          submitted_at: new Date().toISOString(),
          score,
          max_score: maxScore,
          percentage: Number(percentage.toFixed(2)),
          passed,
          status: 'auto_graded',
          updated_at: new Date().toISOString(),
        })
        .eq('id', attempt.id)
        .select()
        .single();

      if (updateError) throw updateError;

      return json({
        attempt: updated,
        result: {
          score,
          maxScore,
          percentage: Number(percentage.toFixed(2)),
          passed,
        },
      });
    }

    if (body.action === 'myAttempts') {
      if (user.role !== 'student') {
        return json({ error: 'Student access required.' }, 403);
      }

      let query = db
        .from('tuition_test_attempts')
        .select('*')
        .eq('student_id', user.user_id)
        .order('created_at', { ascending: false });

      if (body.testId) query = query.eq('test_id', body.testId);

      const { data, error } = await query;
      if (error) throw error;
      return json({ attempts: data || [] });
    }

    if (body.action === 'adminResults') {
      if (!['admin', 'tutor'].includes(user.role)) {
        return json({ error: 'Tutor/Admin access required.' }, 403);
      }

      let query = db
        .from('tuition_test_attempts')
        .select('*')
        .order('created_at', { ascending: false });

      if (body.testId) query = query.eq('test_id', body.testId);

      const { data, error } = await query;
      if (error) throw error;
      return json({ attempts: data || [] });
    }

    return json({ error: 'Unknown action.' }, 400);
  } catch (error) {
    console.error('[tuition-assessments]', error);
    return json(
      { error: error instanceof Error ? error.message : 'Unexpected error.' },
      500,
    );
  }
});
