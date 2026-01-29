'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layout';
import { PostCard, CreatePost } from '@/components/community';
import { mockPosts } from '@/data/mockData';
import { Post } from '@/types';

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>(mockPosts);

  const handleNewPost = (content: string, tags: string[]) => {
    const newPost: Post = {
      id: Date.now().toString(),
      authorId: '1',
      authorName: 'You',
      authorAvatar: '',
      content,
      likes: 0,
      comments: [],
      createdAt: new Date(),
      tags,
    };
    setPosts([newPost, ...posts]);
  };

  return (
    <AppLayout title="Community">
      <div className="space-y-6 max-w-2xl mx-auto">
        <div>
          <h2 className="text-2xl font-bold">Peer Community</h2>
          <p className="text-muted-foreground">
            Connect with fellow students, share your journey, and learn from each other.
          </p>
        </div>

        <CreatePost onPost={handleNewPost} />

        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
