import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut } from 'lucide-react';

export default function AuthControls() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;
  const disabled = loginStatus === 'logging-in';

  const handleAuth = async () => {
    if (isAuthenticated) {
      // Clear all cached data on logout
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        
        // Handle the case where user is already authenticated
        // This can happen after redeployment or cache issues
        if (error.message === 'User is already authenticated') {
          // Force logout and retry
          await clear();
          queryClient.clear();
          
          // Retry login after a short delay
          setTimeout(() => {
            login();
          }, 300);
        }
      }
    }
  };

  return (
    <Button
      onClick={handleAuth}
      disabled={disabled}
      variant={isAuthenticated ? 'outline' : 'default'}
      size="sm"
      className="gap-2"
    >
      {loginStatus === 'logging-in' ? (
        'Signing in...'
      ) : isAuthenticated ? (
        <>
          <LogOut className="h-4 w-4" />
          Sign out
        </>
      ) : (
        <>
          <LogIn className="h-4 w-4" />
          Sign in
        </>
      )}
    </Button>
  );
}
