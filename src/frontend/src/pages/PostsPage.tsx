import { useGetAllPosts, useGetCallerUserProfile } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import PostCard from '../components/PostCard';
import CreatePostForm from '../components/CreatePostForm';
import EmptyState from '../components/EmptyState';
import ProfileSetupModal from '../components/ProfileSetupModal';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Image, AlertCircle, Loader2 } from 'lucide-react';

export default function PostsPage() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: posts = [], isLoading } = useGetAllPosts();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  // Sort posts by createdAt (newest first)
  const sortedPosts = [...posts].sort((a, b) => {
    return Number(b.createdAt - a.createdAt);
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <ProfileSetupModal open={showProfileSetup} />
      
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Posts</h1>
          <p className="text-muted-foreground mt-1">
            Share photos with captions and see what others are posting
          </p>
        </div>

        {!isAuthenticated && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Sign in to create posts. You can still browse posts below.
            </AlertDescription>
          </Alert>
        )}

        {isAuthenticated && <CreatePostForm />}

        <div className="border-t pt-6">
          <h2 className="text-xl font-semibold mb-4">Recent Posts</h2>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
            </div>
          ) : sortedPosts.length === 0 ? (
            <EmptyState
              icon={<Image className="h-16 w-16" />}
              title="No posts yet"
              description={
                isAuthenticated
                  ? 'Be the first to create a post!'
                  : 'Sign in to create the first post.'
              }
            />
          ) : (
            <div className="space-y-6">
              {sortedPosts.map((post) => (
                <PostCard key={post.createdAt.toString()} post={post} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
