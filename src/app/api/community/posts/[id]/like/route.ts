import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { insert, queryOne, update } from '@/lib/db';

// Like/unlike a post
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await authenticateRequest(req);
    if (authResult instanceof NextResponse) return authResult;
    const { id } = await params;

    // Check if already liked
    const existing = await queryOne<any>(
      'SELECT id FROM post_likes WHERE post_id = ? AND user_id = ?',
      [id, authResult.userId]
    );

    if (existing) {
      // Unlike
      await update('DELETE FROM post_likes WHERE id = ?', [existing.id]);
      await update('UPDATE posts SET likes = likes - 1 WHERE id = ?', [id]);
    } else {
      // Like
      await insert('INSERT INTO post_likes (post_id, user_id) VALUES (?, ?)', [id, authResult.userId]);
      await update('UPDATE posts SET likes = likes + 1 WHERE id = ?', [id]);
    }

    // Return updated like count
    const post = await queryOne<any>('SELECT likes FROM posts WHERE id = ?', [id]);
    return NextResponse.json({ liked: !existing, likes: post?.likes || 0 });
  } catch (error) {
    console.error('Like error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
