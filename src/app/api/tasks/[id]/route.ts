import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { queryOne, update, query } from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await authenticateRequest(req);
    if (authResult instanceof NextResponse) return authResult;
    const { id } = await params;

    const body = await req.json();
    const { title, description, category, priority, dueDate, completed } = body;

    // Check ownership
    const task = await queryOne<any>('SELECT id, milestone_id FROM tasks WHERE id = ? AND user_id = ?', [id, authResult.userId]);
    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

    // Server-side quiz gate check: if marking complete and task belongs to a milestone,
    // verify no preceding milestone with an unpassed quiz blocks this task
    if (completed && task.milestone_id) {
      const milestone = await queryOne<any>(
        'SELECT id, roadmap_id, sort_order FROM milestones WHERE id = ?',
        [task.milestone_id]
      );
      if (milestone) {
        // Find all milestones before this one that have a quiz (item_id set)
        const priorMilestones = await query<any[]>(
          `SELECT m.id, m.item_id, m.sort_order
           FROM milestones m
           WHERE m.roadmap_id = ? AND m.sort_order < ? AND m.item_id IS NOT NULL
           ORDER BY m.sort_order`,
          [milestone.roadmap_id, milestone.sort_order]
        );

        for (const pm of priorMilestones) {
          // Check if user has a passing attempt for this milestone's quiz
          const passedAttempt = await queryOne<any>(
            'SELECT id FROM quiz_attempts WHERE user_id = ? AND item_id = ? AND passed = 1',
            [authResult.userId, pm.item_id]
          );
          if (!passedAttempt) {
            return NextResponse.json(
              { error: 'You must pass a preceding milestone quiz before completing this task.' },
              { status: 403 }
            );
          }
        }
      }
    }

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
