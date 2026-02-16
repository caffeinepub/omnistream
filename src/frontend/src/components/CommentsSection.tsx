import { useState } from 'react';
import { useGetComments, useCreateComment, useGetCallerUserProfile } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, MessageSquare } from 'lucide-react';
import type { Comment } from '../backend';

interface CommentsSectionProps {
  mediaTitle: string;
}

export default function CommentsSection({ mediaTitle }: CommentsSectionProps) {
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: comments, isLoading, error } = useGetComments(mediaTitle);
  const createCommentMutation = useCreateComment();
  const [commentText, setCommentText] = useState('');

  const isAuthenticated = !!identity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      await createCommentMutation.mutateAsync({
        mediaTitle,
        text: commentText.trim(),
      });
      setCommentText('');
    } catch (error) {
      console.error('Failed to post comment:', error);
    }
  };

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
    });
  };

  const getAuthorName = (comment: Comment) => {
    // For now, show a fallback since we don't have a way to fetch other users' profiles
    // In a real app, you'd fetch the profile for each unique author
    return 'User';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Comments
          {comments && comments.length > 0 && (
            <span className="text-sm font-normal text-muted-foreground">
              ({comments.length})
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Comment form */}
        {isAuthenticated ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            <Textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="min-h-[80px] resize-none"
              disabled={createCommentMutation.isPending}
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={!commentText.trim() || createCommentMutation.isPending}
                className="gap-2"
              >
                {createCommentMutation.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Post comment
              </Button>
            </div>
            {createCommentMutation.isError && (
              <Alert variant="destructive">
                <AlertDescription>
                  {createCommentMutation.error instanceof Error
                    ? createCommentMutation.error.message
                    : 'Failed to post comment. Please try again.'}
                </AlertDescription>
              </Alert>
            )}
          </form>
        ) : (
          <Alert>
            <AlertDescription>
              Sign in to post a comment.
            </AlertDescription>
          </Alert>
        )}

        {/* Comments list */}
        <div className="space-y-4">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>
                {error instanceof Error
                  ? error.message
                  : 'Failed to load comments. Please try again.'}
              </AlertDescription>
            </Alert>
          )}

          {!isLoading && !error && comments && comments.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No comments yet. Be the first to comment.</p>
            </div>
          )}

          {!isLoading && !error && comments && comments.length > 0 && (
            <div className="space-y-4">
              {comments.map((comment, index) => (
                <div
                  key={`${comment.author.toString()}-${comment.createdAt}-${index}`}
                  className="border-b border-border pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                      {getAuthorName(comment)[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {getAuthorName(comment)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-foreground whitespace-pre-wrap break-words">
                        {comment.text}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
