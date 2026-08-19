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

function activeCompetition(item: any) {
  if (!item.is_published) return false;
  if (item.status === 'cancelled') return false;

  const now = Date.now();
  const start = new Date(item.starts_at).getTime();
  const end = new Date(item.ends_at).getTime();

  if (item.status === 'draft') return false;
  if (now > end) return item.status === 'completed' || item.status === 'published' || item.status === 'live';
  return now >= start || item.status === 'published';
}

async function grade(competitionId: string, answers: Record<string, unknown>) {
  const { data: questions, error } = await db
    .from('tuition_competition_questions')
    .select('id,question_type,correct_answer,marks')
    .eq('competition_id', competitionId)
    .order('question_order', { ascending: true });

  if (error) throw error;

  let score = 0;
  let max = 0;

  for (const q of questions || []) {
    const marks = Number(q.marks || 0);
    max += marks;

    if (q.question_type === 'short_answer') continue;

    const actual = String(answers?.[q.id] ?? '').trim().toLowerCase();
    const expected = String(q.correct_answer ?? '').trim().toLowerCase();

    if (expected && actual === expected) score += marks;
  }

  return {
    score: Number(score.toFixed(2)),
    percentage: max ? Number(((score / max) * 100).toFixed(2)) : 0,
  };
}

async function recalculateRanks(competitionId: string) {
  const { data: results, error } = await db
    .from('tuition_competition_results')
    .select('id,score,percentage,student_id')
    .eq('competition_id', competitionId)
    .order('score', { ascending: false })
    .order('percentage', { ascending: false })
    .order('published_at', { ascending: true });

  if (error) throw error;

  for (let i = 0; i < (results || []).length; i++) {
    await db
      .from('tuition_competition_results')
      .update({ rank: i + 1 })
      .eq('id', results[i].id);

    await db
      .from('tuition_competition_attempts')
      .update({ rank: i + 1 })
      .eq('competition_id', competitionId)
      .eq('student_id', results[i].student_id);
  }
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

    if (body.action === 'studentCompetitions') {
      if (session.role !== 'student') return json({ error: 'Student access required.' }, 403);

      const { data, error } = await db
        .from('tuition_competitions')
        .select('id,title,description,category,course_id,competition_type,starts_at,ends_at,duration_minutes,max_participants,entry_mode,status,is_published')
        .eq('is_published', true)
        .neq('status', 'cancelled')
        .order('starts_at', { ascending: true });

      if (error) throw error;

      return json({ competitions: (data || []).filter(activeCompetition) });
    }

    if (body.action === 'studentCompetition') {
      if (session.role !== 'student') return json({ error: 'Student access required.' }, 403);

      const { data: competition, error } = await db
        .from('tuition_competitions')
        .select('id,title,description,category,course_id,competition_type,starts_at,ends_at,duration_minutes,max_participants,entry_mode,status,is_published')
        .eq('id', body.competitionId)
        .eq('is_published', true)
        .maybeSingle();

      if (error) throw error;
      if (!competition || !activeCompetition(competition)) {
        return json({ error: 'Competition is not available.' }, 404);
      }

      const { data: questions, error: qError } = await db
        .from('tuition_competition_questions')
        .select('id,question_order,question_text,question_type,options,marks,explanation')
        .eq('competition_id', body.competitionId)
        .order('question_order', { ascending: true });

      if (qError) throw qError;

      const { data: entry } = await db
        .from('tuition_competition_entries')
        .select('*')
        .eq('competition_id', body.competitionId)
        .eq('student_id', userId(session))
        .maybeSingle();

      return json({
        competition,
        questions: questions || [],
        entry,
      });
    }

    if (body.action === 'register') {
      if (session.role !== 'student') return json({ error: 'Student access required.' }, 403);

      const studentId = userId(session);
      const { data: competition } = await db
        .from('tuition_competitions')
        .select('*')
        .eq('id', body.competitionId)
        .maybeSingle();

      if (!competition || !activeCompetition(competition)) {
        return json({ error: 'Competition is not available for registration.' }, 404);
      }

      if (competition.max_participants) {
        const { count } = await db
          .from('tuition_competition_entries')
          .select('*', { count: 'exact', head: true })
          .eq('competition_id', body.competitionId)
          .neq('status', 'disqualified');

        if ((count || 0) >= competition.max_participants) {
          return json({ error: 'Competition participant limit has been reached.' }, 409);
        }
      }

      const { data, error } = await db
        .from('tuition_competition_entries')
        .upsert({
          competition_id: body.competitionId,
          student_id: studentId,
          status: 'registered',
        }, { onConflict: 'competition_id,student_id' })
        .select()
        .single();

      if (error) throw error;
      return json({ entry: data });
    }

    if (body.action === 'start') {
      if (session.role !== 'student') return json({ error: 'Student access required.' }, 403);

      const studentId = userId(session);

      const { data: entry } = await db
        .from('tuition_competition_entries')
        .select('*')
        .eq('competition_id', body.competitionId)
        .eq('student_id', studentId)
        .maybeSingle();

      if (!entry) return json({ error: 'Register for the competition first.' }, 403);

      const { data: competition } = await db
        .from('tuition_competitions')
        .select('*')
        .eq('id', body.competitionId)
        .maybeSingle();

      if (!competition || !activeCompetition(competition)) {
        return json({ error: 'Competition is not currently available.' }, 409);
      }

      if (entry.status === 'disqualified') return json({ error: 'This entry is disqualified.' }, 403);
      if (entry.status === 'submitted') return json({ error: 'Competition already submitted.' }, 409);

      const startedAt = entry.started_at || new Date().toISOString();

      if (!entry.started_at) {
        await db
          .from('tuition_competition_entries')
          .update({
            status: 'started',
            started_at: startedAt,
          })
          .eq('id', entry.id);
      }

      const { data: existingAttempt } = await db
        .from('tuition_competition_attempts')
        .select('*')
        .eq('entry_id', entry.id)
        .maybeSingle();

      if (existingAttempt) return json({ attempt: existingAttempt });

      const { data: attempt, error } = await db
        .from('tuition_competition_attempts')
        .insert({
          competition_id: body.competitionId,
          student_id: studentId,
          entry_id: entry.id,
          started_at: startedAt,
        })
        .select()
        .single();

      if (error) throw error;
      return json({ attempt });
    }

    if (body.action === 'submit') {
      if (session.role !== 'student') return json({ error: 'Student access required.' }, 403);

      const studentId = userId(session);

      const { data: attempt } = await db
        .from('tuition_competition_attempts')
        .select('*')
        .eq('id', body.attemptId)
        .eq('student_id', studentId)
        .maybeSingle();

      if (!attempt) return json({ error: 'Competition attempt not found.' }, 404);
      if (attempt.status !== 'in_progress') return json({ error: 'Attempt already submitted.' }, 409);

      const { data: competition } = await db
        .from('tuition_competitions')
        .select('*')
        .eq('id', attempt.competition_id)
        .maybeSingle();

      if (!competition) return json({ error: 'Competition not found.' }, 404);

      const submittedAt = new Date();
      const startedAt = new Date(attempt.started_at);
      const durationSeconds = Math.max(0, Math.round((submittedAt.getTime() - startedAt.getTime()) / 1000));

      const maxSeconds = Number(competition.duration_minutes || 30) * 60;
      const answers = body.answers || {};
      const graded = await grade(attempt.competition_id, answers);

      const { data: updated, error: updateError } = await db
        .from('tuition_competition_attempts')
        .update({
          answers,
          score: graded.score,
          percentage: graded.percentage,
          status: 'evaluated',
          submitted_at: submittedAt.toISOString(),
          duration_seconds: durationSeconds,
        })
        .eq('id', attempt.id)
        .select()
        .single();

      if (updateError) throw updateError;

      const finalScore = durationSeconds > maxSeconds ? 0 : graded.score;
      const finalPercentage = durationSeconds > maxSeconds ? 0 : graded.percentage;
      const award =
        finalPercentage >= 90 ? 'Excellence' :
        finalPercentage >= 75 ? 'Distinction' :
        finalPercentage >= 60 ? 'Merit' :
        null;

      await db
        .from('tuition_competition_entries')
        .update({
          status: 'submitted',
          submitted_at: submittedAt.toISOString(),
        })
        .eq('id', attempt.entry_id);

      const { data: result, error: resultError } = await db
        .from('tuition_competition_results')
        .upsert({
          competition_id: attempt.competition_id,
          student_id: studentId,
          attempt_id: attempt.id,
          score: finalScore,
          percentage: finalPercentage,
          award,
        }, { onConflict: 'competition_id,student_id' })
        .select()
        .single();

      if (resultError) throw resultError;

      await recalculateRanks(attempt.competition_id);

      return json({
        attempt: updated,
        result: {
          ...result,
          score: finalScore,
          percentage: finalPercentage,
          timedOut: durationSeconds > maxSeconds,
        },
      });
    }

    if (body.action === 'leaderboard') {
      if (session.role !== 'student' && session.role !== 'admin' && session.role !== 'tutor') {
        return json({ error: 'Authorized access required.' }, 403);
      }

      const { data, error } = await db
        .from('tuition_competition_results')
        .select('student_id,score,percentage,rank,award,published_at')
        .eq('competition_id', body.competitionId)
        .order('rank', { ascending: true, nullsFirst: false })
        .limit(100);

      if (error) throw error;

      return json({ leaderboard: data || [] });
    }

    if (body.action === 'tutorCompetitions') {
      if (session.role !== 'tutor') return json({ error: 'Tutor access required.' }, 403);

      const tutorId = userId(session);
      const { data, error } = await db
        .from('tuition_competitions')
        .select('*')
        .eq('created_by', tutorId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return json({ competitions: data || [] });
    }

    if (body.action === 'createCompetition') {
      if (session.role !== 'tutor') return json({ error: 'Tutor access required.' }, 403);

      const tutorId = userId(session);
      if (!body.title || !body.category || !body.startsAt || !body.endsAt) {
        return json({ error: 'Title, category, start and end time are required.' }, 400);
      }

      const { data, error } = await db
        .from('tuition_competitions')
        .insert({
          title: body.title,
          description: body.description || null,
          category: body.category,
          course_id: body.courseId || null,
          competition_type: body.competitionType || 'quiz',
          starts_at: body.startsAt,
          ends_at: body.endsAt,
          duration_minutes: Number(body.durationMinutes || 30),
          max_participants: body.maxParticipants ? Number(body.maxParticipants) : null,
          entry_mode: body.entryMode || 'free',
          status: body.isPublished ? 'published' : 'draft',
          is_published: !!body.isPublished,
          created_by: tutorId,
        })
        .select()
        .single();

      if (error) throw error;
      return json({ competition: data });
    }

    if (body.action === 'addQuestion') {
      if (session.role !== 'tutor') return json({ error: 'Tutor access required.' }, 403);

      const tutorId = userId(session);
      const { data: competition } = await db
        .from('tuition_competitions')
        .select('id')
        .eq('id', body.competitionId)
        .eq('created_by', tutorId)
        .maybeSingle();

      if (!competition) return json({ error: 'Competition not found.' }, 404);
      if (!body.questionText) return json({ error: 'Question text is required.' }, 400);

      const { data, error } = await db
        .from('tuition_competition_questions')
        .insert({
          competition_id: body.competitionId,
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

    if (body.action === 'adminCompetitions') {
      if (session.role !== 'admin') return json({ error: 'Admin access required.' }, 403);

      const { data, error } = await db
        .from('tuition_competitions')
        .select('*')
        .order('starts_at', { ascending: false })
        .limit(500);

      if (error) throw error;
      return json({ competitions: data || [] });
    }

    return json({ error: 'Unknown action.' }, 400);
  } catch (error) {
    console.error('[tuition-competitions]', error);
    return json({
      error: error instanceof Error ? error.message : 'Unexpected error.',
    }, 500);
  }
});
