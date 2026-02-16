import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useGetAllActiveLiveSessions, useStartLiveSession } from '../hooks/useQueries';
import ProfileSetupModal from '../components/ProfileSetupModal';
import EmptyState from '../components/EmptyState';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Radio, Plus, Loader2, Eye } from 'lucide-react';
import { toast } from 'sonner';

export default function LivePage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const { data: liveSessions = [], isLoading: sessionsLoading } = useGetAllActiveLiveSessions();
  const startLiveSession = useStartLiveSession();

  const [showStartForm, setShowStartForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  const handleStartSession = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Please enter a title for your live session');
      return;
    }

    try {
      await startLiveSession.mutateAsync({ title: title.trim(), description: description.trim() });
      toast.success('Live session started!');
      setTitle('');
      setDescription('');
      setShowStartForm(false);
      navigate({ to: '/live/$title', params: { title: title.trim() } });
    } catch (error: any) {
      console.error('Failed to start live session:', error);
      toast.error(error.message || 'Failed to start live session');
    }
  };

  return (
    <>
      <ProfileSetupModal open={showProfileSetup} />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <Radio className="h-8 w-8 text-red-500" />
              Live Sessions
            </h1>
            <p className="text-muted-foreground">
              {isAuthenticated ? 'Browse live sessions or start your own' : 'Browse active live sessions'}
            </p>
          </div>
          {isAuthenticated && !showStartForm && (
            <Button onClick={() => setShowStartForm(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Go Live
            </Button>
          )}
        </div>

        {showStartForm && isAuthenticated && (
          <Card>
            <CardHeader>
              <CardTitle>Start a Live Session</CardTitle>
              <CardDescription>
                Create a new live session (metadata only - no real streaming)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleStartSession} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter session title"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your live session"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={startLiveSession.isPending} className="gap-2">
                    {startLiveSession.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Starting...
                      </>
                    ) : (
                      <>
                        <Radio className="h-4 w-4" />
                        Start Live Session
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowStartForm(false);
                      setTitle('');
                      setDescription('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {sessionsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : liveSessions.length === 0 ? (
          <EmptyState
            icon={<Radio className="h-16 w-16" />}
            title="No live sessions"
            description={
              isAuthenticated
                ? 'Be the first to go live! Click "Go Live" to start a session.'
                : 'No one is live right now. Check back later!'
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {liveSessions.map((session) => (
              <Card
                key={session.title}
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => navigate({ to: '/live/$title', params: { title: session.title } })}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg line-clamp-2">{session.title}</CardTitle>
                    <Badge variant="destructive" className="gap-1 shrink-0">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                      </span>
                      LIVE
                    </Badge>
                  </div>
                  {session.description && (
                    <CardDescription className="line-clamp-2">{session.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Eye className="h-4 w-4" />
                    <span>Started {new Date(Number(session.startTime) / 1000000).toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
