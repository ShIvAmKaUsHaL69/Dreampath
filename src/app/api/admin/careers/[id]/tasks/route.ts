import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, requireSuperAdmin } from '@/lib/auth';
import { query, insert, update } from '@/lib/db';

// GET /api/admin/careers/[id]/tasks — get predefined tasks for a career
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await authenticateRequest(req);
    if (authResult instanceof NextResponse) return authResult;
    const forbidden = requireSuperAdmin(authResult);
    if (forbidden) return forbidden;
    const { id } = await params;

    const tasks = await query<any[]>(
      'SELECT * FROM career_default_tasks WHERE career_id = ? ORDER BY sort_order',
      [id]
    );

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Career tasks GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/careers/[id]/tasks — add a predefined task
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await authenticateRequest(req);
    if (authResult instanceof NextResponse) return authResult;
    const forbidden = requireSuperAdmin(authResult);
    if (forbidden) return forbidden;
    const { id } = await params;

    const body = await req.json();
    const { title, description, category, priority } = body;
    if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 });

    const maxOrder = await query<any[]>('SELECT COALESCE(MAX(sort_order),0) as mx FROM career_default_tasks WHERE career_id = ?', [id]);
    const taskId = await insert(
      'INSERT INTO career_default_tasks (career_id, title, description, category, priority, sort_order) VALUES (?,?,?,?,?,?)',
      [id, title, description || null, category || 'study', priority || 'medium', (maxOrder[0]?.mx || 0) + 1]
    );

    return NextResponse.json({ id: taskId, message: 'Task added' }, { status: 201 });
  } catch (error) {
    console.error('Career task POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/admin/careers/[id]/tasks — delete a predefined task (taskId in body)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await authenticateRequest(req);
    if (authResult instanceof NextResponse) return authResult;
    const forbidden = requireSuperAdmin(authResult);
    if (forbidden) return forbidden;

    const body = await req.json();
    const { taskId } = body;
    if (!taskId) return NextResponse.json({ error: 'taskId required' }, { status: 400 });

    await update('DELETE FROM career_default_tasks WHERE id = ?', [taskId]);
    return NextResponse.json({ message: 'Task deleted' });
  } catch (error) {
    console.error('Career task DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
