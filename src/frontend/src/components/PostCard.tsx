import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useGetUserProfile } from '../hooks/useQueries';
import type { Post } from '../backend';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const { data: authorProfile } = useGetUserProfile(post.creator);

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const authorName = authorProfile?.name || 'Anonymous';
  const imageUrl = post.image.getDirectURL();

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials(authorName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-semibold">{authorName}</p>
            <p className="text-sm text-muted-foreground">{formatDate(post.createdAt)}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pb-4">
        <div className="relative w-full rounded-lg overflow-hidden bg-muted">
          <img
            src={imageUrl}
            alt={post.caption}
            className="w-full h-auto object-contain max-h-[600px]"
            loading="lazy"
          />
        </div>
        {post.caption && (
          <p className="text-sm whitespace-pre-wrap break-words">{post.caption}</p>
        )}
      </CardContent>
    </Card>
  );
}
