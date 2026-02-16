import { useEffect, useState } from 'react';
import { useCamera } from '../camera/useCamera';
import { Button } from '@/components/ui/button';
import { Camera, Loader2, AlertCircle, SwitchCamera } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface LiveCameraPreviewProps {
  onStop?: () => void;
}

export default function LiveCameraPreview({ onStop }: LiveCameraPreviewProps) {
  const [preflightError, setPreflightError] = useState<string | null>(null);
  const [preflightLoading, setPreflightLoading] = useState(true);
  const [preflightStream, setPreflightStream] = useState<MediaStream | null>(null);

  const {
    isActive,
    isSupported,
    error,
    isLoading,
    currentFacingMode,
    startCamera,
    stopCamera,
    capturePhoto,
    switchCamera,
    retry,
    videoRef,
    canvasRef,
  } = useCamera({
    facingMode: 'user',
    width: 1280,
    height: 720,
    quality: 0.9,
    format: 'image/jpeg',
  });

  // Combined camera + microphone permission preflight on mount
  useEffect(() => {
    let mounted = true;

    const requestCombinedPermissions = async () => {
      try {
        setPreflightLoading(true);
        setPreflightError(null);

        // Request both camera and microphone in a single prompt
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (!mounted) {
          // Component unmounted during request, cleanup immediately
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        // Store stream for cleanup
        setPreflightStream(stream);

        // Stop preflight tracks immediately after permission granted
        stream.getTracks().forEach(track => track.stop());

        // Permission granted, now start the camera preview
        setPreflightLoading(false);
        await startCamera();
      } catch (err: any) {
        if (!mounted) return;

        console.error('Combined permission error:', err);
        setPreflightLoading(false);

        // Handle permission denial or other errors
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setPreflightError('Camera or microphone permission denied. You can still create a live session without the preview.');
        } else if (err.name === 'NotFoundError') {
          setPreflightError('Camera or microphone not found. You can still create a live session without the preview.');
        } else if (err.name === 'NotSupportedError') {
          setPreflightError('Camera or microphone not supported in your browser. You can still create a live session without the preview.');
        } else {
          setPreflightError(`Camera or microphone unavailable: ${err.message}. You can still create a live session without the preview.`);
        }
      }
    };

    requestCombinedPermissions();

    // Cleanup: stop all tracks on unmount
    return () => {
      mounted = false;
      
      // Stop preflight stream if it exists
      if (preflightStream) {
        preflightStream.getTracks().forEach(track => track.stop());
      }
      
      // Stop camera preview
      stopCamera();
    };
  }, []);

  const handleCapture = async () => {
    const photo = await capturePhoto();
    if (photo) {
      console.log('Photo captured:', photo.name, photo.size);
      // Photo captured but not uploaded (local-only preview)
    }
  };

  const handleSwitchCamera = async () => {
    const newMode = currentFacingMode === 'user' ? 'environment' : 'user';
    await switchCamera(newMode);
  };

  // Preflight permission error
  if (preflightError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{preflightError}</AlertDescription>
      </Alert>
    );
  }

  // Camera not supported
  if (isSupported === false) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Camera is not supported in your browser. You can still create a live session without the camera preview.
        </AlertDescription>
      </Alert>
    );
  }

  // Camera error (from useCamera hook)
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error.type === 'permission' && (
            <>Camera or microphone permission denied. You can still create a live session without the preview.</>
          )}
          {error.type === 'not-found' && (
            <>Camera or microphone not found. You can still create a live session without the preview.</>
          )}
          {(error.type === 'unknown' || error.type === 'not-supported') && (
            <>Camera or microphone unavailable: {error.message}. You can still create a live session without the preview.</>
          )}
          {error.type !== 'permission' && (
            <Button
              variant="outline"
              size="sm"
              onClick={retry}
              disabled={isLoading}
              className="mt-2"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Retry'}
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  // Loading state (preflight or camera initialization)
  if (preflightLoading || isLoading || isSupported === null) {
    return (
      <div className="relative w-full bg-muted rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {preflightLoading ? 'Requesting camera and microphone permissions...' : 'Initializing camera...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative w-full bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '16/9', minHeight: '200px' }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        
        {/* Camera controls overlay */}
        {isActive && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={handleCapture}
              className="gap-2 bg-white/90 hover:bg-white text-black"
            >
              <Camera className="h-4 w-4" />
              Capture
            </Button>
            
            {/* Only show switch camera on mobile/devices with multiple cameras */}
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={handleSwitchCamera}
              disabled={isLoading}
              className="gap-2 bg-white/90 hover:bg-white text-black md:hidden"
            >
              <SwitchCamera className="h-4 w-4" />
              Switch
            </Button>
          </div>
        )}
      </div>
      
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          This is a local camera preview only. Real-time livestream video to viewers is not implemented in this version.
        </AlertDescription>
      </Alert>
    </div>
  );
}
