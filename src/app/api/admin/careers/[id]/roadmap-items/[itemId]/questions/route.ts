import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, requireSuperAdmin } from '@/lib/auth';
import { query, insert, update } from '@/lib/db';

// GET — all quiz questions for a roadmap item (milestone)
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string; itemId: string }> }) {
  try {
    const authResult = await authenticateRequest(req);
    if (authResult instanceof NextResponse) return authResult;
    const forbidden = requireSuperAdmin(authResult);
    if (forbidden) return forbidden;
    const { itemId } = await params;

    const questions = await query<any[]>(
      'SELECT * FROM quiz_questions WHERE item_id = ? ORDER BY sort_order',
      [itemId]
    );

    // Parse options from JSON string
    const parsed = questions.map((q: any) => ({
      ...q,
      options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
    }));

    return NextResponse.json({ questions: parsed });
  } catch (error) {
    console.error('Quiz questions GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST — add a quiz question
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string; itemId: string }> }) {
  try {
    const authResult = await authenticateRequest(req);
    if (authResult instanceof NextResponse) return authResult;
    const forbidden = requireSuperAdmin(authResult);
    if (forbidden) return forbidden;
    const { itemId } = await params;

    const body = await req.json();
    const { question, options, correctIndex } = body;

    if (!question || !options || options.length < 2) {
      return NextResponse.json({ error: 'Question and at least 2 options are required' }, { status: 400 });
    }

    const maxOrder = await query<any[]>(
      'SELECT COALESCE(MAX(sort_order),0) as mx FROM quiz_questions WHERE item_id = ?', [itemId]
    );

    const qId = await insert(
      'INSERT INTO quiz_questions (item_id, question, options, correct_index, sort_order) VALUES (?,?,?,?,?)',
      [itemId, question, JSON.stringify(options), correctIndex || 0, (maxOrder[0]?.mx || 0) + 1]
    );

    return NextResponse.json({ id: qId, message: 'Question added' }, { status: 201 });
  } catch (error) {
    console.error('Quiz question POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT — update a quiz question
export async function PUT(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req);
    if (authResult instanceof NextResponse) return authResult;
    const forbidden = requireSuperAdmin(authResult);
    if (forbidden) return forbidden;

    const body = await req.json();
    const { questionId, question, options, correctIndex } = body;

    if (!questionId) return NextResponse.json({ error: 'questionId required' }, { status: 400 });

    const sets: string[] = [];
    const vals: any[] = [];
    if (question !== undefined) { sets.push('question = ?'); vals.push(question); }
    if (options !== undefined) { sets.push('options = ?'); vals.push(JSON.stringify(options)); }
    if (correctIndex !== undefined) { sets.push('correct_index = ?'); vals.push(correctIndex); }

    if (sets.length === 0) return NextResponse.json({ error: 'No fields to update' }, { status: 400 });

    vals.push(questionId);
    await update(`UPDATE quiz_questions SET ${sets.join(', ')} WHERE id = ?`, vals);

    return NextResponse.json({ message: 'Question updated' });
  } catch (error) {
    console.error('Quiz question PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE — delete a quiz question
export async function DELETE(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req);
    if (authResult instanceof NextResponse) return authResult;
    const forbidden = requireSuperAdmin(authResult);
    if (forbidden) return forbidden;

    const body = await req.json();
    const { questionId } = body;
    if (!questionId) return NextResponse.json({ error: 'questionId required' }, { status: 400 });

    await update('DELETE FROM quiz_questions WHERE id = ?', [questionId]);
    return NextResponse.json({ message: 'Question deleted' });
  } catch (error) {
    console.error('Quiz question DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
