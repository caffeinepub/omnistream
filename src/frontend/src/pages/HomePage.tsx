import { useGetAllVideos } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import VideoCard from '../components/VideoCard';
import EmptyState from '../components/EmptyState';
import ProfileSetupModal from '../components/ProfileSetupModal';
import { Video, Loader2 } from 'lucide-react';

export default function HomePage() {
  const { identity } = useInternetIdentity();
  const { data: videos, isLoading } = useGetAllVideos();
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
          <h1 className="text-3xl font-bold mb-2">Videos</h1>
          <p className="text-muted-foreground">Discover the latest video content</p>
        </div>

        {videos && videos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos.map((video) => (
              <VideoCard key={video.title} media={video} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Video className="h-16 w-16" />}
            title="No videos yet"
            description="Be the first to upload a video and share it with the community!"
          />
        )}
      </div>
    </>
  );
}
