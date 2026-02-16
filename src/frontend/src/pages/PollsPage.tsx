import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Plus, X, AlertCircle, BarChart3, CheckCircle2 } from 'lucide-react';
import { useGetAllPolls, useCreatePoll, useGetCallerUserProfile } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import PollCard from '../components/PollCard';
import EmptyState from '../components/EmptyState';
import ProfileSetupModal from '../components/ProfileSetupModal';

export default function PollsPage() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: polls = [], isLoading } = useGetAllPolls();
  const createPollMutation = useCreatePoll();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  const handleAddOption = () => {
    setOptions([...options, '']);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleCreatePoll = async () => {
    const trimmedQuestion = question.trim();
    const trimmedOptions = options.map(opt => opt.trim()).filter(opt => opt.length > 0);

    if (!trimmedQuestion) {
      return;
    }

    if (trimmedOptions.length < 2) {
      return;
    }

    try {
      await createPollMutation.mutateAsync({
        question: trimmedQuestion,
        options: trimmedOptions,
      });

      // Reset form
      setQuestion('');
      setOptions(['', '']);
      setShowCreateForm(false);
    } catch (error) {
      // Error is handled by mutation
    }
  };

  const canSubmit = question.trim().length > 0 && 
    options.filter(opt => opt.trim().length > 0).length >= 2;

  // Memoize the rendered poll list to prevent re-renders during form typing
  const pollsList = useMemo(() => {
    if (isLoading) {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading polls...</p>
        </div>
      );
    }
    
    if (polls.length === 0) {
      return (
        <EmptyState
          icon={<BarChart3 className="h-16 w-16" />}
          title="No polls yet"
          description={
            isAuthenticated
              ? 'Be the first to create a poll!'
              : 'Sign in to create the first poll.'
          }
        />
      );
    }
    
    return (
      <div className="space-y-4">
        {polls.map((poll) => (
          <PollCard key={poll.id} poll={poll} />
        ))}
      </div>
    );
  }, [polls, isLoading, isAuthenticated]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <ProfileSetupModal open={showProfileSetup} />
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Polls</h1>
            <p className="text-muted-foreground mt-1">
              Vote on community polls and see what others think
            </p>
          </div>
          {isAuthenticated && (
            <Button
              onClick={() => setShowCreateForm(!showCreateForm)}
              variant={showCreateForm ? 'outline' : 'default'}
            >
              {showCreateForm ? (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Poll
                </>
              )}
            </Button>
          )}
        </div>

        {!isAuthenticated && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Sign in to create polls and vote on existing ones.
            </AlertDescription>
          </Alert>
        )}

        {showCreateForm && isAuthenticated && (
          <Card>
            <CardHeader>
              <CardTitle>Create a New Poll</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="question">Question</Label>
                <Input
                  id="question"
                  placeholder="What's your question?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                />
              </div>

              <div className="space-y-3">
                <Label>Options (minimum 2)</Label>
                {options.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder={`Option ${index + 1}`}
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                    />
                    {options.length > 2 && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleRemoveOption(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddOption}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Option
                </Button>
              </div>

              {createPollMutation.isError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {createPollMutation.error instanceof Error
                      ? createPollMutation.error.message
                      : 'Failed to create poll. Please try again.'}
                  </AlertDescription>
                </Alert>
              )}

              {createPollMutation.isSuccess && (
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>Poll created successfully!</AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleCreatePoll}
                disabled={!canSubmit || createPollMutation.isPending}
                className="w-full"
              >
                {createPollMutation.isPending
                  ? 'Creating...'
                  : !question.trim()
                  ? 'Enter a question'
                  : options.filter(opt => opt.trim().length > 0).length < 2
                  ? 'Add at least 2 options'
                  : 'Create Poll'}
              </Button>
            </CardContent>
          </Card>
        )}

        <Separator />

        {pollsList}
      </div>
    </div>
  );
}
