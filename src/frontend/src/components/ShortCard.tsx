import { Link } from '@tanstack/react-router';
import { Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { PublicMediaMeta } from '../backend';

interface ShortCardProps {
  media: PublicMediaMeta;
}

export default function ShortCard({ media }: ShortCardProps) {
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Link to="/watch/$title" params={{ title: media.title }}>
      <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer border-border/50">
        <div className="relative aspect-[9/16] bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-orange-500/10 overflow-hidden">
          <video
            src={media.mediaData.getDirectURL()}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            preload="metadata"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="font-semibold text-white text-sm line-clamp-2 mb-2 drop-shadow-lg">
              {media.title}
            </h3>
            <div className="flex items-center gap-1 text-xs text-white/90">
              <Clock className="h-3 w-3" />
              {formatDuration(Number(media.durationSeconds))}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
