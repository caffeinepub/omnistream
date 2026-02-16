import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function BackendUnavailableBanner() {
  const handleReload = () => {
    window.location.reload();
  };

  const hostname = window.location.hostname;
  const isIcp0Domain = hostname.includes('.icp0.io');
  const isCustomDomain = hostname === 'ommistream.net' || hostname === 'www.ommistream.net';

  const getCurrentUrl = () => {
    if (isIcp0Domain) {
      return `https://${hostname}`;
    }
    return null;
  };

  const currentUrl = getCurrentUrl();

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
            {!isIcp0Domain && !isCustomDomain && (
              <li className="font-medium text-destructive">
                The custom domain may be misconfigured
              </li>
            )}
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
            
            {isIcp0Domain && currentUrl && (
              <p className="text-sm pt-2">
                You're accessing OmniStream from the canister URL: <span className="font-mono font-medium">{currentUrl}</span>
              </p>
            )}
            
            {isCustomDomain && (
              <p className="text-sm pt-2">
                You're accessing OmniStream from the custom domain: <span className="font-mono font-medium">https://{hostname}</span>
                <br />
                The intended custom domain is <span className="font-mono font-medium">https://ommistream.net</span>
              </p>
            )}
            
            {!isIcp0Domain && !isCustomDomain && (
              <div className="text-sm pt-2 space-y-1">
                <p className="font-medium">Try accessing from the correct URL:</p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li>
                    <span className="font-medium">Custom domain:</span> <span className="font-mono">https://ommistream.net/#/</span>
                  </li>
                  <li>
                    <span className="font-medium">Canister URL:</span> <span className="font-mono">https://&lt;FRONTEND_CANISTER_ID&gt;.icp0.io/#/</span>
                  </li>
                </ul>
                <p className="pt-2 text-muted-foreground">
                  If you're using a custom domain, verify that DNS is correctly configured and propagated.
                </p>
              </div>
            )}
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
