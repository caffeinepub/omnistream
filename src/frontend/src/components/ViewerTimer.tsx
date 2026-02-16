import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Timer, Play, Square } from 'lucide-react';

interface ViewerTimerProps {
  onTimerEnd: () => void;
}

export default function ViewerTimer({ onTimerEnd }: ViewerTimerProps) {
  const [minutes, setMinutes] = useState(5);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            setIsActive(false);
            onTimerEnd();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, onTimerEnd]);

  const startTimer = () => {
    const totalSeconds = minutes * 60 + seconds;
    if (totalSeconds > 0) {
      setTimeLeft(totalSeconds);
      setIsActive(true);
    }
  };

  const stopTimer = () => {
    setIsActive(false);
    setTimeLeft(0);
  };

  const formatTimeLeft = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Timer className="h-5 w-5" />
          Viewer Timer
        </CardTitle>
        <CardDescription>
          Set a timer to pause the video automatically
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isActive ? (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minutes">Minutes</Label>
              <Input
                id="minutes"
                type="number"
                min="0"
                max="1440"
                value={minutes}
                onChange={(e) => setMinutes(Math.max(0, parseInt(e.target.value) || 0))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seconds">Seconds</Label>
              <Input
                id="seconds"
                type="number"
                min="0"
                max="59"
                value={seconds}
                onChange={(e) => setSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
              />
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-4xl font-bold text-cyan-400 mb-2">
              {formatTimeLeft(timeLeft)}
            </div>
            <p className="text-sm text-muted-foreground">Time remaining</p>
          </div>
        )}
        <Button
          onClick={isActive ? stopTimer : startTimer}
          className="w-full"
          variant={isActive ? 'destructive' : 'default'}
        >
          {isActive ? (
            <>
              <Square className="h-4 w-4 mr-2" />
              Stop Timer
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Start Timer
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
