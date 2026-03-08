import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { query, insert, queryOne } from '@/lib/db';

// POST /api/quiz/attempt — submit quiz answers and get score
export async function POST(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req);
    if (authResult instanceof NextResponse) return authResult;

    const body = await req.json();
    const { milestoneItemId, roadmapId, answers } = body;
    // answers: { [questionId]: selectedIndex }

    if (!milestoneItemId || !roadmapId || !answers) {
      return NextResponse.json({ error: 'milestoneItemId, roadmapId, and answers are required' }, { status: 400 });
    }

    // Get milestone passing score
    const milestone = await queryOne<any>(
      'SELECT id, passing_score FROM career_roadmap_items WHERE id = ? AND type = ?',
      [milestoneItemId, 'milestone']
    );
    if (!milestone) return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });

    // Get questions with correct answers
    const questions = await query<any[]>(
      'SELECT id, correct_index FROM quiz_questions WHERE item_id = ? ORDER BY sort_order',
      [milestoneItemId]
    );

    if (questions.length === 0) {
      return NextResponse.json({ error: 'No questions for this milestone' }, { status: 400 });
    }

    // Score
    let correct = 0;
    for (const q of questions) {
      const qId = String(q.id);
      if (answers[qId] !== undefined && Number(answers[qId]) === q.correct_index) {
        correct++;
      }
    }

    const scorePercent = Math.round((correct / questions.length) * 100);
    const passed = scorePercent >= milestone.passing_score;

    // Save attempt
    const attemptId = await insert(
      `INSERT INTO quiz_attempts (user_id, roadmap_id, item_id, score, total_questions, passed, answers)
       VALUES (?,?,?,?,?,?,?)`,
      [authResult.userId, roadmapId, milestoneItemId, scorePercent, questions.length, passed ? 1 : 0, JSON.stringify(answers)]
    );

    return NextResponse.json({
      attemptId,
      score: scorePercent,
      correct,
      total: questions.length,
      passed,
      passingScore: milestone.passing_score,
    });
  } catch (error) {
    console.error('Quiz attempt error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/quiz/attempt?roadmapId=X — get all quiz attempts for a roadmap
export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req);
    if (authResult instanceof NextResponse) return authResult;

    const { searchParams } = new URL(req.url);
    const roadmapId = searchParams.get('roadmapId');

    if (!roadmapId) {
      return NextResponse.json({ error: 'roadmapId is required' }, { status: 400 });
    }

    const attempts = await query<any[]>(
      `SELECT qa.*, cri.title as milestone_title
       FROM quiz_attempts qa
       JOIN career_roadmap_items cri ON qa.item_id = cri.id
       WHERE qa.user_id = ? AND qa.roadmap_id = ?
       ORDER BY qa.created_at DESC`,
      [authResult.userId, roadmapId]
    );

    return NextResponse.json({ attempts });
  } catch (error) {
    console.error('Quiz attempts GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
