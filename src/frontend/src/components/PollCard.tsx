import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { useVotePoll } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import type { Poll } from '../types/poll';

interface PollCardProps {
  poll: Poll;
}

export default function PollCard({ poll }: PollCardProps) {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const voteMutation = useVotePoll();

  // Calculate total votes and percentages
  const totalVotes = poll.optionVotes.reduce((sum, votes) => sum + Number(votes), 0);
  const percentages = poll.optionVotes.map(votes => 
    totalVotes > 0 ? (Number(votes) / totalVotes) * 100 : 0
  );

  const handleVote = async () => {
    if (selectedOption === null) {
      return;
    }

    try {
      await voteMutation.mutateAsync({
        pollId: poll.id,
        optionIndex: selectedOption,
      });
      setSelectedOption(null);
    } catch (error) {
      // Error is handled by mutation
    }
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">{poll.question}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'} · {formatDate(poll.createdAt)}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isAuthenticated ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please sign in to vote on this poll.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <RadioGroup
              value={selectedOption?.toString()}
              onValueChange={(value) => setSelectedOption(parseInt(value))}
            >
              <div className="space-y-3">
                {poll.options.map((option, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value={index.toString()} id={`${poll.id}-option-${index}`} />
                      <Label
                        htmlFor={`${poll.id}-option-${index}`}
                        className="flex-1 cursor-pointer"
                      >
                        {option}
                      </Label>
                      <span className="text-sm font-medium text-muted-foreground">
                        {percentages[index].toFixed(1)}%
                      </span>
                    </div>
                    <div className="ml-6 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${percentages[index]}%` }}
                      />
                    </div>
                    <p className="ml-6 text-xs text-muted-foreground">
                      {Number(poll.optionVotes[index])} {Number(poll.optionVotes[index]) === 1 ? 'vote' : 'votes'}
                    </p>
                  </div>
                ))}
              </div>
            </RadioGroup>

            {voteMutation.isError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {voteMutation.error instanceof Error
                    ? voteMutation.error.message
                    : 'Failed to submit vote. Please try again.'}
                </AlertDescription>
              </Alert>
            )}

            {voteMutation.isSuccess && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>Your vote has been recorded!</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleVote}
              disabled={selectedOption === null || voteMutation.isPending}
              className="w-full"
            >
              {voteMutation.isPending
                ? 'Submitting...'
                : selectedOption === null
                ? 'Select an option to vote'
                : 'Submit Vote'}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
