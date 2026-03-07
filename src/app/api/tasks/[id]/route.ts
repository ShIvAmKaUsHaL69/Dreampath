import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { queryOne, update } from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await authenticateRequest(req);
    if (authResult instanceof NextResponse) return authResult;
    const { id } = await params;

    const body = await req.json();
    const { title, description, category, priority, dueDate, completed } = body;

    // Check ownership
    const task = await queryOne<any>('SELECT id FROM tasks WHERE id = ? AND user_id = ?', [id, authResult.userId]);
    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

    const sets: string[] = [];
    const vals: any[] = [];

    if (title !== undefined) { sets.push('title = ?'); vals.push(title); }
    if (description !== undefined) { sets.push('description = ?'); vals.push(description); }
    if (category !== undefined) { sets.push('category = ?'); vals.push(category); }
    if (priority !== undefined) { sets.push('priority = ?'); vals.push(priority); }
    if (dueDate !== undefined) { sets.push('due_date = ?'); vals.push(dueDate); }
    if (completed !== undefined) {
      sets.push('completed = ?');
      vals.push(completed ? 1 : 0);
      sets.push('completed_at = ?');
      vals.push(completed ? new Date() : null);
    }

    if (sets.length === 0) return NextResponse.json({ error: 'No fields to update' }, { status: 400 });

    vals.push(id);
    await update(`UPDATE tasks SET ${sets.join(', ')} WHERE id = ?`, vals);

    return NextResponse.json({ message: 'Task updated' });
  } catch (error) {
    console.error('Task PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await authenticateRequest(req);
    if (authResult instanceof NextResponse) return authResult;
    const { id } = await params;

    const affected = await update('DELETE FROM tasks WHERE id = ? AND user_id = ?', [id, authResult.userId]);
    if (affected === 0) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

    return NextResponse.json({ message: 'Task deleted' });
  } catch (error) {
    console.error('Task DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
