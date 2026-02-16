import { useState, useRef, ChangeEvent, useEffect } from 'react';
import { useUploadMedia } from '../hooks/useQueries';
import { MediaType } from '../backend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Video, Film, Clock, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface UploadFormProps {
  onSuccess: (title: string) => void;
  initialMediaType?: 'video' | 'short';
}

const ONE_DAY_SECONDS = 24 * 60 * 60;

export default function UploadForm({ onSuccess, initialMediaType }: UploadFormProps) {
  const [title, setTitle] = useState('');
  const [mediaType, setMediaType] = useState<'video' | 'short'>(initialMediaType || 'video');
  const [file, setFile] = useState<File | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
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
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        setDuration(Math.floor(video.duration));
        URL.revokeObjectURL(video.src);
      };
      video.src = URL.createObjectURL(selectedFile);
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
    if (!file || !duration || !title.trim()) return;

    // Client-side validation for 24-hour limit
    if (duration > ONE_DAY_SECONDS) {
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
  const canSubmit = title.trim() && file && duration && !isUploading && !durationExceeded;

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

          {duration !== null && (
            <Alert variant={durationExceeded ? 'destructive' : 'default'}>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                Duration: <strong>{formatDuration(duration)}</strong>
                {durationExceeded && (
                  <span className="block mt-1 font-semibold">
                    This video exceeds the 24-hour limit and cannot be uploaded.
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}

          {uploadMutation.isError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {uploadMutation.error instanceof Error
                  ? uploadMutation.error.message
                  : 'Upload failed. Please try again.'}
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
            {isUploading ? 'Uploading...' : durationExceeded ? 'Duration Exceeds Limit' : 'Upload'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
