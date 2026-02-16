import { useState, ChangeEvent, useEffect } from 'react';
import { useUploadMedia } from '../hooks/useQueries';
import { MediaType } from '../backend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Video, Film, Clock, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface UploadFormProps {
  onSuccess: (title: string) => void;
  initialMediaType?: 'video' | 'short';
}

const ONE_DAY_SECONDS = 24 * 60 * 60;
const MIN_SHORT_SECONDS = 3;

export default function UploadForm({ onSuccess, initialMediaType }: UploadFormProps) {
  const [title, setTitle] = useState('');
  const [mediaType, setMediaType] = useState<'video' | 'short'>(initialMediaType || 'video');
  const [file, setFile] = useState<File | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [durationLoading, setDurationLoading] = useState(false);
  const [durationError, setDurationError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const uploadMutation = useUploadMedia();

  useEffect(() => {
    if (initialMediaType) {
      setMediaType(initialMediaType);
    }
  }, [initialMediaType]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setDuration(null);
      setDurationError(null);
      setDurationLoading(true);

      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = () => {
        const detectedDuration = Math.floor(video.duration);
        
        if (!detectedDuration || detectedDuration === 0 || !isFinite(detectedDuration)) {
          setDurationError('Could not read video duration. Please try a different file.');
          setDuration(null);
        } else {
          setDuration(detectedDuration);
          setDurationError(null);
        }
        
        setDurationLoading(false);
        URL.revokeObjectURL(video.src);
      };

      video.onerror = () => {
        setDurationError('Failed to load video metadata. Please try a different file.');
        setDuration(null);
        setDurationLoading(false);
        URL.revokeObjectURL(video.src);
      };

      video.src = URL.createObjectURL(selectedFile);
    } else {
      setFile(null);
      setDuration(null);
      setDurationError(null);
      setDurationLoading(false);
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      return;
    }

    if (!file) {
      return;
    }

    if (durationLoading) {
      return;
    }

    if (durationError) {
      return;
    }

    if (duration === null) {
      return;
    }

    if (duration > ONE_DAY_SECONDS) {
      return;
    }

    if (mediaType === 'short' && duration < MIN_SHORT_SECONDS) {
      return;
    }

    try {
      const result = await uploadMutation.mutateAsync({
        title: title.trim(),
        mediaType: mediaType === 'video' ? MediaType.video : MediaType.short_,
        file,
        duration,
        onProgress: setUploadProgress,
      });
      onSuccess(result.title);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const isUploading = uploadMutation.isPending;
  const durationExceeded = duration !== null && duration > ONE_DAY_SECONDS;
  const shortTooShort = mediaType === 'short' && duration !== null && duration < MIN_SHORT_SECONDS;
  const canSubmit = 
    title.trim() && 
    file && 
    !durationLoading && 
    !durationError && 
    duration !== null && 
    duration > 0 &&
    !isUploading && 
    !durationExceeded && 
    !shortTooShort;

  const getSubmitButtonText = () => {
    if (isUploading) return 'Uploading...';
    if (!title.trim()) return 'Enter Title';
    if (!file) return 'Select File';
    if (durationLoading) return 'Detecting Duration...';
    if (durationError) return 'Invalid File';
    if (duration === null) return 'Waiting for Duration';
    if (durationExceeded) return 'Duration Exceeds 24h Limit';
    if (shortTooShort) return 'Short Too Short (Min 3s)';
    return 'Upload';
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Media
        </CardTitle>
        <CardDescription>
          Share your videos and shorts with the OmniStream community
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title for your video"
              disabled={isUploading}
              required
            />
          </div>

          <div className="space-y-3">
            <Label>Media Type</Label>
            <RadioGroup
              value={mediaType}
              onValueChange={(value) => setMediaType(value as 'video' | 'short')}
              disabled={isUploading}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="video" id="video" />
                <Label htmlFor="video" className="flex items-center gap-2 cursor-pointer">
                  <Video className="h-4 w-4" />
                  Video
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="short" id="short" />
                <Label htmlFor="short" className="flex items-center gap-2 cursor-pointer">
                  <Film className="h-4 w-4" />
                  Short
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Media File</Label>
            <Input
              id="file"
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              disabled={isUploading}
              required
            />
          </div>

          {durationLoading && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>
                Detecting video duration, please wait...
              </AlertDescription>
            </Alert>
          )}

          {durationError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Duration Error:</strong> {durationError}
              </AlertDescription>
            </Alert>
          )}

          {duration !== null && !durationError && (
            <Alert variant={durationExceeded || shortTooShort ? 'destructive' : 'default'}>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Duration: <strong>{formatDuration(duration)}</strong>
                {durationExceeded && (
                  <span className="block mt-2 font-semibold text-destructive">
                    ⚠️ This video exceeds the 24-hour limit and cannot be uploaded. Please select a shorter video.
                  </span>
                )}
                {shortTooShort && (
                  <span className="block mt-2 font-semibold text-destructive">
                    ⚠️ Shorts must be at least 3 seconds long. Please select a longer video or upload as a regular video instead.
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}

          {uploadMutation.isError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Upload Failed:</strong>{' '}
                {uploadMutation.error instanceof Error
                  ? uploadMutation.error.message
                  : 'An unexpected error occurred. Please try again.'}
              </AlertDescription>
            </Alert>
          )}

          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          )}

          <Button type="submit" disabled={!canSubmit} className="w-full">
            {getSubmitButtonText()}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
