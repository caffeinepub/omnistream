import { useGetForYouFeed } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import VideoCard from '../components/VideoCard';
import ShortCard from '../components/ShortCard';
import EmptyState from '../components/EmptyState';
import ProfileSetupModal from '../components/ProfileSetupModal';
import { Sparkles, Loader2 } from 'lucide-react';

export default function HomePage() {
  const { identity } = useInternetIdentity();
  const { data: feed, isLoading } = useGetForYouFeed();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <>
      <ProfileSetupModal open={showProfileSetup} />
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">For You</h1>
          <p className="text-muted-foreground">Discover videos and shorts curated for you</p>
        </div>

        {feed && feed.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {feed.map((media) => (
              media.mediaType === 'video' ? (
                <VideoCard key={media.title} media={media} />
              ) : (
                <ShortCard key={media.title} media={media} />
              )
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Sparkles className="h-16 w-16" />}
            title="No content yet"
            description="Be the first to upload and share your videos and shorts with the community!"
          />
        )}
      </div>
    </>
  );
}
