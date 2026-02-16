import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function BackendUnavailableBanner() {
  const handleReload = () => {
    window.location.reload();
  };

  const getCanisterUrl = () => {
    const hostname = window.location.hostname;
    if (hostname.includes('.icp0.io')) {
      return `https://${hostname}`;
    }
    return 'your deployed canister URL (https://xxxxx.icp0.io)';
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Alert variant="destructive" className="border-2">
        <AlertCircle className="h-5 w-5" />
        <AlertTitle className="text-lg font-semibold mb-2">
          Service Temporarily Unavailable
        </AlertTitle>
        <AlertDescription className="space-y-3">
          <p>
            OmniStream cannot connect to the backend service. This may happen if:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>The network connection is unstable</li>
            <li>The backend canister is not responding</li>
            <li>You're accessing the site from an incorrect URL</li>
          </ul>
          <div className="pt-2 space-y-2">
            <p className="font-medium">What you can try:</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                onClick={handleReload} 
                variant="outline" 
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Reload Page
              </Button>
            </div>
            <p className="text-sm pt-2">
              Make sure you're accessing OmniStream from the correct deployed URL: {getCanisterUrl()}
            </p>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
