import { useParams, useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetLiveSession, useEndLiveSession } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Radio, Loader2, StopCircle, Clock, Info } from 'lucide-react';
import { toast } from 'sonner';

export default function LiveDetailsPage() {
  const { title } = useParams({ from: '/live/$title' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: session, isLoading, error } = useGetLiveSession(title);
  const endLiveSession = useEndLiveSession();

  const isAuthenticated = !!identity;
  const isOwner = isAuthenticated && session && identity.getPrincipal().toString() === session.streamer.toString();

  const handleEndSession = async () => {
    if (!session) return;

    try {
      await endLiveSession.mutateAsync(session.title);
      toast.success('Live session ended');
      navigate({ to: '/live' });
    } catch (error: any) {
      console.error('Failed to end live session:', error);
      toast.error(error.message || 'Failed to end live session');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Session Not Found</CardTitle>
            <CardDescription>The live session you're looking for doesn't exist.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate({ to: '/live' })} variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Live Sessions
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button onClick={() => navigate({ to: '/live' })} variant="ghost" size="sm" className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to Live Sessions
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <Radio className="h-6 w-6 text-red-500" />
                <CardTitle className="text-2xl">{session.title}</CardTitle>
              </div>
              {session.description && (
                <CardDescription className="text-base">{session.description}</CardDescription>
              )}
            </div>
            {session.isActive ? (
              <Badge variant="destructive" className="gap-1 shrink-0">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                LIVE
              </Badge>
            ) : (
              <Badge variant="secondary">Ended</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              This is a metadata-only live session. Real-time video streaming is not implemented in this MVP.
            </AlertDescription>
          </Alert>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Started: {new Date(Number(session.startTime) / 1000000).toLocaleString()}</span>
          </div>

          {isOwner && session.isActive && (
            <div className="pt-4 border-t">
              <Button
                onClick={handleEndSession}
                disabled={endLiveSession.isPending}
                variant="destructive"
                className="gap-2"
              >
                {endLiveSession.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Ending...
                  </>
                ) : (
                  <>
                    <StopCircle className="h-4 w-4" />
                    End Live Session
                  </>
                )}
              </Button>
            </div>
          )}

          {!session.isActive && (
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">This live session has ended.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
