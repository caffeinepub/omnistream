import { Link } from '@tanstack/react-router';
import { Clock, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { PublicMediaMeta } from '../backend';

interface VideoCardProps {
  media: PublicMediaMeta;
}

export default function VideoCard({ media }: VideoCardProps) {
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <Link to="/watch/$title" params={{ title: media.title }}>
      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer border-border/50">
        <div className="relative aspect-video bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-orange-500/10 overflow-hidden">
          <video
            src={media.mediaData.getDirectURL()}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            preload="metadata"
          />
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
            {formatDuration(Number(media.durationSeconds))}
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-base line-clamp-2 mb-2 group-hover:text-cyan-400 transition-colors">
            {media.title}
          </h3>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDuration(Number(media.durationSeconds))}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(media.createdAt)}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
