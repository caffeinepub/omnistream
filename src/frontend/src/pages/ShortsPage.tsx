import { useGetAllShorts } from '../hooks/useQueries';
import ShortCard from '../components/ShortCard';
import EmptyState from '../components/EmptyState';
import { Film, Loader2, Play } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ShortsPage() {
  const { data: shorts, isLoading } = useGetAllShorts();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">Shorts</h1>
            <Badge variant="secondary" className="gap-1.5 px-3 py-1 text-sm font-semibold">
              <Play className="h-3.5 w-3.5" />
              Watch Shorts
            </Badge>
          </div>
          <p className="text-muted-foreground">Quick, engaging vertical videos</p>
        </div>
      </div>

      {shorts && shorts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {shorts.map((short) => (
            <ShortCard key={short.title} media={short} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Film className="h-16 w-16" />}
          title="No shorts yet"
          description="Be the first to upload a short and start the trend!"
        />
      )}
    </div>
  );
}
