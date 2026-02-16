import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Timer, Play, Square, AlertCircle, Clock } from 'lucide-react';

interface ViewerTimerProps {
  onTimerEnd: () => void;
}

export default function ViewerTimer({ onTimerEnd }: ViewerTimerProps) {
  const [fromHour, setFromHour] = useState('12');
  const [fromMinute, setFromMinute] = useState('00');
  const [toHour, setToHour] = useState('12');
  const [toMinute, setToMinute] = useState('05');
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [validationError, setValidationError] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

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

  const parseTime = (hour: string, minute: string): number => {
    const h = parseInt(hour) || 0;
    const m = parseInt(minute) || 0;
    return h * 60 + m;
  };

  const startTimer = () => {
    setValidationError('');
    
    const fromMinutes = parseTime(fromHour, fromMinute);
    const toMinutes = parseTime(toHour, toMinute);
    
    if (toMinutes <= fromMinutes) {
      setValidationError('End time must be after start time');
      return;
    }
    
    const durationMinutes = toMinutes - fromMinutes;
    const totalSeconds = durationMinutes * 60;
    
    if (totalSeconds > 0) {
      setTimeLeft(totalSeconds);
      setIsActive(true);
    }
  };

  const stopTimer = () => {
    setIsActive(false);
    setTimeLeft(0);
    setValidationError('');
  };

  const formatTimeLeft = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatCurrentTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const handleNumberInput = (value: string, max: number, setter: (val: string) => void) => {
    const num = value.replace(/\D/g, '');
    if (num === '' || parseInt(num) <= max) {
      setter(num.padStart(2, '0').slice(-2));
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Timer className="h-5 w-5 flex-shrink-0" />
          Viewer Timer
        </CardTitle>
        <CardDescription className="text-sm">
          Set a time range to automatically pause the video
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-center gap-2 py-3 px-4 bg-muted/50 rounded-lg">
          <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="text-xl sm:text-2xl font-mono font-semibold tabular-nums">
            {formatCurrentTime(currentTime)}
          </span>
        </div>

        {!isActive ? (
          <>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">From</Label>
                <div className="flex items-center gap-1 sm:gap-2">
                  <Input
                    type="text"
                    value={fromHour}
                    onChange={(e) => handleNumberInput(e.target.value, 23, setFromHour)}
                    placeholder="HH"
                    className="w-14 sm:w-16 text-center text-base sm:text-lg font-mono"
                    maxLength={2}
                  />
                  <span className="text-lg sm:text-xl font-semibold">:</span>
                  <Input
                    type="text"
                    value={fromMinute}
                    onChange={(e) => handleNumberInput(e.target.value, 59, setFromMinute)}
                    placeholder="MM"
                    className="w-14 sm:w-16 text-center text-base sm:text-lg font-mono"
                    maxLength={2}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">To</Label>
                <div className="flex items-center gap-1 sm:gap-2">
                  <Input
                    type="text"
                    value={toHour}
                    onChange={(e) => handleNumberInput(e.target.value, 23, setToHour)}
                    placeholder="HH"
                    className="w-14 sm:w-16 text-center text-base sm:text-lg font-mono"
                    maxLength={2}
                  />
                  <span className="text-lg sm:text-xl font-semibold">:</span>
                  <Input
                    type="text"
                    value={toMinute}
                    onChange={(e) => handleNumberInput(e.target.value, 59, setToMinute)}
                    placeholder="MM"
                    className="w-14 sm:w-16 text-center text-base sm:text-lg font-mono"
                    maxLength={2}
                  />
                </div>
              </div>
            </div>

            {validationError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">{validationError}</AlertDescription>
              </Alert>
            )}

            <Button onClick={startTimer} className="w-full gap-2 h-11">
              <Play className="h-4 w-4" />
              Start Timer
            </Button>
          </>
        ) : (
          <>
            <div className="text-center py-6">
              <div className="text-4xl sm:text-5xl font-bold tabular-nums font-mono">
                {formatTimeLeft(timeLeft)}
              </div>
              <p className="text-sm text-muted-foreground mt-3">Time remaining</p>
            </div>
            <Button onClick={stopTimer} variant="destructive" className="w-full gap-2 h-11">
              <Square className="h-4 w-4" />
              Stop Timer
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
