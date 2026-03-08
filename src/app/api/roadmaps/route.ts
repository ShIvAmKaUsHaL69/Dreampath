import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { query, queryOne, insert } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req);
    if (authResult instanceof NextResponse) return authResult;

    const roadmaps = await query<any[]>(
      `SELECT r.*, c.title as career_title, c.slug as career_slug
       FROM roadmaps r JOIN careers c ON r.career_id = c.id
       WHERE r.user_id = ? ORDER BY r.created_at DESC`,
      [authResult.userId]
    );

    const result = await Promise.all(roadmaps.map(async (r: any) => {
      const milestones = await query<any[]>(
        'SELECT * FROM milestones WHERE roadmap_id = ? ORDER BY sort_order',
        [r.id]
      );

      const milestonesWithTasks = await Promise.all(milestones.map(async (m: any) => {
        const tasks = await query<any[]>(
          'SELECT * FROM tasks WHERE milestone_id = ? ORDER BY due_date',
          [m.id]
        );
        return {
          id: String(m.id),
          title: m.title,
          description: m.description,
          dueDate: m.due_date,
          completed: !!m.completed,
          itemId: m.item_id ? Number(m.item_id) : null,
          tasks: tasks.map((t: any) => ({
            id: String(t.id),
            title: t.title,
            description: t.description,
            category: t.category,
            priority: t.priority,
            dueDate: t.due_date,
            completed: !!t.completed,
            completedAt: t.completed_at,
          })),
        };
      }));

      return {
        id: String(r.id),
        careerId: r.career_slug,
        careerNumericId: String(r.career_id),
        studentId: String(r.user_id),
        title: r.title,
        description: r.description,
        startDate: r.start_date,
        endDate: r.end_date,
        milestones: milestonesWithTasks,
        progress: r.progress,
      };
    }));

    return NextResponse.json({ roadmaps: result });
  } catch (error) {
    console.error('Roadmaps error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req);
    if (authResult instanceof NextResponse) return authResult;

    const body = await req.json();
    const { careerId, title, description, startDate, endDate, milestones } = body;

    // Lookup career by ID or slug
    let career;
    if (!isNaN(Number(careerId))) {
      career = await queryOne<any>('SELECT id FROM careers WHERE id = ?', [careerId]);
    }
    if (!career) {
      career = await queryOne<any>('SELECT id FROM careers WHERE slug = ?', [careerId]);
    }
    if (!career) return NextResponse.json({ error: 'Career not found' }, { status: 404 });

    const roadmapId = await insert(
      'INSERT INTO roadmaps (user_id, career_id, title, description, start_date, end_date) VALUES (?,?,?,?,?,?)',
      [authResult.userId, career.id, title, description || '', startDate, endDate]
    );

    // Insert milestones
    if (milestones?.length) {
      for (let i = 0; i < milestones.length; i++) {
        const m = milestones[i];
        const msId = await insert(
          'INSERT INTO milestones (roadmap_id, title, description, due_date, sort_order, item_id) VALUES (?,?,?,?,?,?)',
          [roadmapId, m.title, m.description || '', m.dueDate, i, m.itemId || null]
        );

        // Create tasks linked to this milestone
        if (m.tasks?.length) {
          for (const t of m.tasks) {
            const taskDue = t.dueDate || m.dueDate;
            await insert(
              'INSERT INTO tasks (user_id, milestone_id, title, description, category, priority, due_date) VALUES (?,?,?,?,?,?,?)',
              [authResult.userId, msId, t.title, t.description || null, t.category || 'study', t.priority || 'medium', taskDue]
            );
          }
        }
      }
    }

    return NextResponse.json({ id: roadmapId, message: 'Roadmap created' }, { status: 201 });
  } catch (error) {
    console.error('Roadmap POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
