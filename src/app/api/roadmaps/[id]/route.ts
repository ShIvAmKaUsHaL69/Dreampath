import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { update, queryOne } from '@/lib/db';

// DELETE /api/roadmaps/[id] — remove a roadmap
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await authenticateRequest(req);
    if (authResult instanceof NextResponse) return authResult;
    const { id } = await params;

    // Verify the roadmap belongs to the user
    const roadmap = await queryOne<any>(
      'SELECT id FROM roadmaps WHERE id = ? AND user_id = ?',
      [id, authResult.userId]
    );
    if (!roadmap) return NextResponse.json({ error: 'Roadmap not found' }, { status: 404 });

    // Delete the roadmap (milestones + tasks cascade)
    await update('DELETE FROM roadmaps WHERE id = ?', [id]);

    return NextResponse.json({ message: 'Roadmap removed' });
  } catch (error) {
    console.error('Roadmap DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
