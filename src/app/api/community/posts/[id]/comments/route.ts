import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { insert, queryOne } from '@/lib/db';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await authenticateRequest(req);
    if (authResult instanceof NextResponse) return authResult;
    const { id } = await params;

    const body = await req.json();
    const { content } = body;
    if (!content) return NextResponse.json({ error: 'Content is required' }, { status: 400 });

    const commentId = await insert(
      'INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)',
      [id, authResult.userId, content]
    );

    // Get user name for the response
    const user = await queryOne<any>('SELECT name FROM users WHERE id = ?', [authResult.userId]);

    return NextResponse.json({
      comment: {
        id: String(commentId),
        authorId: String(authResult.userId),
        authorName: user?.name || 'User',
        authorAvatar: '',
        content,
        createdAt: new Date(),
      },
      message: 'Comment added',
    }, { status: 201 });
  } catch (error) {
    console.error('Comment POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
