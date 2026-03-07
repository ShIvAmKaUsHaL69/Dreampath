'use client';

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout';
import { PostCard, CreatePost } from '@/components/community';
import { Post } from '@/types';
import { useApp } from '@/contexts/AppContext';
import { Loader2 } from 'lucide-react';

export default function CommunityPage() {
  const { apiFetch } = useApp();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/community/posts');
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleNewPost = async (content: string, tags: string[]) => {
    try {
      const res = await apiFetch('/api/community/posts', {
        method: 'POST',
        body: JSON.stringify({ content, tags }),
      });
      if (res.ok) {
        // Refresh posts
        fetchPosts();
      }
    } catch {
    }
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

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            {posts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No posts yet. Be the first to share!</p>
              </div>
            )}
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
