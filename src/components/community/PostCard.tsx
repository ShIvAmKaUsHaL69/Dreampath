'use client';

import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Post, Comment } from '@/types';
import { Heart, MessageCircle, Share2, Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/contexts/AppContext';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const { apiFetch } = useApp();
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<Comment[]>(post.comments || []);
  const [liking, setLiking] = useState(false);
  const [commenting, setCommenting] = useState(false);

  const handleLike = async () => {
    if (liking) return;
    setLiking(true);
    try {
      const res = await apiFetch(`/api/community/posts/${post.id}/like`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setLiked(data.liked);
        setLikesCount(data.likes);
      }
    } catch {
      // Silent fail
    } finally {
      setLiking(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || commenting) return;
    setCommenting(true);
    try {
      const res = await apiFetch(`/api/community/posts/${post.id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content: newComment }),
      });
      if (res.ok) {
        const data = await res.json();
        setComments([...comments, data.comment]);
        setNewComment('');
      }
    } catch {
      // Silent fail
    } finally {
      setCommenting(false);
    }
  };

  const timeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start gap-3 pb-3">
        <Avatar>
          <AvatarFallback>{post.authorName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="font-semibold">{post.authorName}</p>
            <span className="text-xs text-muted-foreground">
              {timeAgo(post.createdAt)}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">Student</p>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <p className="whitespace-pre-wrap">{post.content}</p>
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-3 pt-0">
        <div className="flex items-center justify-between w-full border-t pt-3">
          <Button
            variant="ghost"
            size="sm"
            className={cn('gap-2 cursor-pointer', liked && 'text-red-500')}
            onClick={handleLike}
            disabled={liking}
          >
            {liking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Heart className={cn('h-4 w-4', liked && 'fill-current')} />}
            {likesCount}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 cursor-pointer"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle className="h-4 w-4" />
            {comments.length}
          </Button>
          <Button variant="ghost" size="sm" className="gap-2 cursor-pointer">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </div>

        {showComments && (
          <div className="w-full space-y-3 border-t pt-3">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {comment.authorName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 rounded-lg bg-muted p-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{comment.authorName}</p>
                    <span className="text-xs text-muted-foreground">
                      {timeAgo(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm">{comment.content}</p>
                </div>
              </div>
            ))}
            <div className="flex gap-2">
              <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1"
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
              />
              <Button size="icon" onClick={handleAddComment} disabled={commenting || !newComment.trim()} className="cursor-pointer">
                {commenting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
