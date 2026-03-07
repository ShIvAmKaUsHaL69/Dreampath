import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { query, insert, update, queryOne } from '@/lib/db';

// GET community posts
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const posts = await query<any[]>(
      `SELECT p.*, u.name as author_name, u.id as author_id
       FROM posts p JOIN users u ON p.user_id = u.id
       ORDER BY p.created_at DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    // Fetch comments for each post
    const result = await Promise.all(posts.map(async (post: any) => {
      const comments = await query<any[]>(
        `SELECT c.*, u.name as author_name FROM comments c JOIN users u ON c.user_id = u.id WHERE c.post_id = ? ORDER BY c.created_at ASC`,
        [post.id]
      );
      return {
        id: String(post.id),
        authorId: String(post.author_id),
        authorName: post.author_name,
        authorAvatar: '',
        content: post.content,
        likes: post.likes,
        tags: JSON.parse(post.tags || '[]'),
        createdAt: post.created_at,
        comments: comments.map((c: any) => ({
          id: String(c.id),
          authorId: String(c.user_id),
          authorName: c.author_name,
          authorAvatar: '',
          content: c.content,
          createdAt: c.created_at,
        })),
      };
    }));

    return NextResponse.json({ posts: result });
  } catch (error) {
    console.error('Posts GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// CREATE post
export async function POST(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req);
    if (authResult instanceof NextResponse) return authResult;

    const body = await req.json();
    const { content, tags } = body;
    if (!content) return NextResponse.json({ error: 'Content is required' }, { status: 400 });

    const postId = await insert(
      'INSERT INTO posts (user_id, content, tags) VALUES (?, ?, ?)',
      [authResult.userId, content, JSON.stringify(tags || [])]
    );

    return NextResponse.json({ id: postId, message: 'Post created' }, { status: 201 });
  } catch (error) {
    console.error('Posts POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
