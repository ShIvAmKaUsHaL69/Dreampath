import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { query, insert } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req);
    if (authResult instanceof NextResponse) return authResult;

    const tasks = await query<any[]>(
      'SELECT * FROM tasks WHERE user_id = ? ORDER BY due_date ASC, priority DESC',
      [authResult.userId]
    );

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Tasks GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req);
    if (authResult instanceof NextResponse) return authResult;

    const body = await req.json();
    const { title, description, category, priority, dueDate, milestoneId } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const taskId = await insert(
      'INSERT INTO tasks (user_id, milestone_id, title, description, category, priority, due_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [authResult.userId, milestoneId || null, title, description || null, category || 'study', priority || 'medium', dueDate || null]
    );

    return NextResponse.json({ id: taskId, message: 'Task created' }, { status: 201 });
  } catch (error) {
    console.error('Tasks POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
