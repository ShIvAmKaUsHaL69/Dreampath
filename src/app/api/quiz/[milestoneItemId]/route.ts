import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { query } from '@/lib/db';

// GET /api/quiz/[milestoneItemId] — fetch quiz questions for a milestone
export async function GET(req: NextRequest, { params }: { params: Promise<{ milestoneItemId: string }> }) {
  try {
    const authResult = await authenticateRequest(req);
    if (authResult instanceof NextResponse) return authResult;
    const { milestoneItemId } = await params;

    // Get the milestone info
    const milestone = await query<any[]>(
      'SELECT id, title, description, passing_score FROM career_roadmap_items WHERE id = ? AND type = ?',
      [milestoneItemId, 'milestone']
    );
    if (!milestone.length) {
      return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
    }

    // Get questions
    const questions = await query<any[]>(
      'SELECT id, question, options, sort_order FROM quiz_questions WHERE item_id = ? ORDER BY sort_order',
      [milestoneItemId]
    );

    const parsed = questions.map((q: any) => ({
      id: q.id,
      question: q.question,
      options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
    }));

    return NextResponse.json({
      milestone: milestone[0],
      questions: parsed,
      totalQuestions: parsed.length,
    });
  } catch (error) {
    console.error('Quiz GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
