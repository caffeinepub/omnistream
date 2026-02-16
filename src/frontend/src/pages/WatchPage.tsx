import { useRef } from 'react';
import { useParams, Link } from '@tanstack/react-router';
import { useGetMediaByTitle } from '../hooks/useQueries';
import VideoPlayer, { VideoPlayerRef } from '../components/VideoPlayer';
import ViewerTimer from '../components/ViewerTimer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Calendar, Clock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function WatchPage() {
  const { title } = useParams({ from: '/watch/$title' });
  const { data: media, isLoading, error } = useGetMediaByTitle(title);
  const playerRef = useRef<VideoPlayerRef>(null);

  const handleTimerEnd = () => {
    playerRef.current?.pause();
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  if (error || !media) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <Button variant="ghost" asChild>
          <Link to="/" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </Button>
        <Alert variant="destructive">
          <AlertDescription>
            Video not found. It may have been removed or the link is incorrect.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Button variant="ghost" asChild>
        <Link to="/" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <VideoPlayer
            ref={playerRef}
            src={media.mediaData.getDirectURL()}
            title={media.title}
          />
          <div className="space-y-3">
            <h1 className="text-2xl font-bold">{media.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {formatDate(media.createdAt)}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {formatDuration(Number(media.durationSeconds))}
              </div>
              <div className="px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20">
                {media.mediaType === 'video' ? 'Video' : 'Short'}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <ViewerTimer onTimerEnd={handleTimerEnd} />
        </div>
      </div>
    </div>
  );
}
