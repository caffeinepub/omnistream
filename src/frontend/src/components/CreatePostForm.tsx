import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Image, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import { useCreatePost } from '../hooks/useQueries';
import { ExternalBlob } from '../backend';

export default function CreatePostForm() {
  const [caption, setCaption] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const createPostMutation = useCreatePost();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile || !caption.trim()) {
      return;
    }

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

      await createPostMutation.mutateAsync({
        image: blob,
        caption: caption.trim(),
      });

      // Reset form
      setCaption('');
      setSelectedFile(null);
      setPreviewUrl(null);
      setUploadProgress(0);
      
      // Clear file input
      const fileInput = document.getElementById('post-image-input') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (error) {
      // Error is handled by mutation
      setUploadProgress(0);
    }
  };

  const canSubmit = selectedFile && caption.trim().length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Post</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="post-image-input">Choose Photo</Label>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => document.getElementById('post-image-input')?.click()}
              disabled={createPostMutation.isPending}
            >
              <Upload className="h-4 w-4 mr-2" />
              {selectedFile ? 'Change Photo' : 'Select Photo'}
            </Button>
            {selectedFile && (
              <span className="text-sm text-muted-foreground">{selectedFile.name}</span>
            )}
          </div>
          <input
            id="post-image-input"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {previewUrl && (
          <div className="relative w-full rounded-lg overflow-hidden bg-muted border">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-auto object-contain max-h-[400px]"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="caption">Caption</Label>
          <Textarea
            id="caption"
            placeholder="Write a caption for your photo..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={3}
            disabled={createPostMutation.isPending}
          />
        </div>

        {createPostMutation.isPending && uploadProgress > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} />
          </div>
        )}

        {createPostMutation.isError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {createPostMutation.error instanceof Error
                ? createPostMutation.error.message
                : 'Failed to create post. Please try again.'}
            </AlertDescription>
          </Alert>
        )}

        {createPostMutation.isSuccess && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>Post created successfully!</AlertDescription>
          </Alert>
        )}

        <Button
          onClick={handleSubmit}
          disabled={!canSubmit || createPostMutation.isPending}
          className="w-full"
        >
          {createPostMutation.isPending
            ? 'Creating Post...'
            : !selectedFile
            ? 'Select a photo'
            : !caption.trim()
            ? 'Add a caption'
            : 'Create Post'}
        </Button>
      </CardContent>
    </Card>
  );
}
