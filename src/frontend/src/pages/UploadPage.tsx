import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import UploadForm from '../components/UploadForm';
import ProfileSetupModal from '../components/ProfileSetupModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn, Upload, Eye } from 'lucide-react';

export default function UploadPage() {
  const navigate = useNavigate();
  const { identity, login } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  const handleUploadSuccess = (title: string) => {
    navigate({ to: '/watch/$title', params: { title } });
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Media
            </CardTitle>
            <CardDescription>
              You are browsing as a guest
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4 py-8">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Eye className="h-5 w-5" />
              <span className="font-medium">Guests can browse content</span>
            </div>
            <p className="text-center text-muted-foreground">
              To upload videos and shorts to OmniStream, you must sign in first.
            </p>
            <Button onClick={login} size="lg" className="gap-2">
              <LogIn className="h-5 w-5" />
              Sign in to Upload
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <ProfileSetupModal open={showProfileSetup} />
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Upload</h1>
          <p className="text-muted-foreground">Share your content with the world</p>
        </div>
        <UploadForm onSuccess={handleUploadSuccess} />
      </div>
    </>
  );
}
