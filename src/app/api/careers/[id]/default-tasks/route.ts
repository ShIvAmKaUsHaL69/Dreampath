import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';

// GET /api/careers/[id]/default-tasks — public endpoint for predefined roadmap items
// [id] can be a slug (e.g. "software-engineer") or numeric ID
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Resolve slug or numeric ID to the actual career
    let career;
    if (!isNaN(Number(id))) {
      career = await queryOne<any>('SELECT id FROM careers WHERE id = ?', [id]);
    }
    if (!career) {
      career = await queryOne<any>('SELECT id FROM careers WHERE slug = ?', [id]);
    }
    if (!career) {
      return NextResponse.json({ tasks: [] }); // no career = no tasks
    }

    const items = await query<any[]>(
      'SELECT id, type, title, description, category, priority, passing_score, sort_order FROM career_roadmap_items WHERE career_id = ? ORDER BY sort_order',
      [career.id]
    );

    // For milestone items, also fetch quiz question count
    const result = await Promise.all(items.map(async (item: any) => {
      if (item.type === 'milestone') {
        const qCount = await query<any[]>(
          'SELECT COUNT(*) as cnt FROM quiz_questions WHERE item_id = ?', [item.id]
        );
        return { ...item, questionCount: qCount[0]?.cnt || 0 };
      }
      return { ...item, questionCount: 0 };
    }));

    return NextResponse.json({ tasks: result });
  } catch (error) {
    console.error('Career default tasks error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
