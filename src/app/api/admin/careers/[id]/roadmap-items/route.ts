import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, requireSuperAdmin } from '@/lib/auth';
import { query, insert, update } from '@/lib/db';

// GET — all roadmap items for a career (ordered)
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await authenticateRequest(req);
    if (authResult instanceof NextResponse) return authResult;
    const forbidden = requireSuperAdmin(authResult);
    if (forbidden) return forbidden;
    const { id } = await params;

    const items = await query<any[]>(
      'SELECT * FROM career_roadmap_items WHERE career_id = ? ORDER BY sort_order',
      [id]
    );

    // Attach quiz question count for milestones
    const result = await Promise.all(items.map(async (item: any) => {
      if (item.type === 'milestone') {
        const questions = await query<any[]>(
          'SELECT COUNT(*) as cnt FROM quiz_questions WHERE item_id = ?', [item.id]
        );
      return { ...item, questionCount: questions[0]?.cnt || 0 };
      }
      return { ...item, questionCount: 0 };
    }));

    return NextResponse.json({ items: result });
  } catch (error) {
    console.error('Roadmap items GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST — add task or milestone
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await authenticateRequest(req);
    if (authResult instanceof NextResponse) return authResult;
    const forbidden = requireSuperAdmin(authResult);
    if (forbidden) return forbidden;
    const { id } = await params;

    const body = await req.json();
    const { type, title, description, category, priority, passingScore, daysOffset } = body;
    if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 });

    const maxOrder = await query<any[]>(
      'SELECT COALESCE(MAX(sort_order),0) as mx FROM career_roadmap_items WHERE career_id = ?', [id]
    );

    const itemId = await insert(
      `INSERT INTO career_roadmap_items (career_id, type, title, description, category, priority, passing_score, sort_order, days_offset)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [id, type || 'task', title, description || null, category || 'study', priority || 'medium', passingScore || 50, (maxOrder[0]?.mx || 0) + 1, daysOffset || 0]
    );

    return NextResponse.json({ id: itemId, message: 'Item added' }, { status: 201 });
  } catch (error) {
    console.error('Roadmap item POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT — reorder items (drag-and-drop)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await authenticateRequest(req);
    if (authResult instanceof NextResponse) return authResult;
    const forbidden = requireSuperAdmin(authResult);
    if (forbidden) return forbidden;

    const body = await req.json();
    const { orderedIds } = body; // array of item IDs in new order

    if (!orderedIds?.length) {
      return NextResponse.json({ error: 'orderedIds required' }, { status: 400 });
    }

    for (let i = 0; i < orderedIds.length; i++) {
      await update('UPDATE career_roadmap_items SET sort_order = ? WHERE id = ?', [i, orderedIds[i]]);
    }

    return NextResponse.json({ message: 'Order updated' });
  } catch (error) {
    console.error('Roadmap items PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE — delete an item
export async function DELETE(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req);
    if (authResult instanceof NextResponse) return authResult;
    const forbidden = requireSuperAdmin(authResult);
    if (forbidden) return forbidden;

    const body = await req.json();
    const { itemId } = body;
    if (!itemId) return NextResponse.json({ error: 'itemId required' }, { status: 400 });

    await update('DELETE FROM career_roadmap_items WHERE id = ?', [itemId]);
    return NextResponse.json({ message: 'Item deleted' });
  } catch (error) {
    console.error('Roadmap item DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
