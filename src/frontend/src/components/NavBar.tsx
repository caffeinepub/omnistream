import { Link, useNavigate } from '@tanstack/react-router';
import { Sparkles, Film, Upload, User, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AuthControls from './AuthControls';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';

export default function NavBar() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-orange-400 bg-clip-text text-transparent">
                OmniStream
              </div>
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/" className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  For You
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/shorts" className="gap-2">
                  <Film className="h-4 w-4" />
                  Shorts
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/live" className="gap-2">
                  <Radio className="h-4 w-4" />
                  Live
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/upload" className="gap-2">
                  <Upload className="h-4 w-4" />
                  Upload
                </Link>
              </Button>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            {!isAuthenticated && (
              <Badge variant="outline" className="hidden sm:flex">
                Browsing as a guest
              </Badge>
            )}
            {isAuthenticated && userProfile && (
              <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>{userProfile.name}</span>
              </div>
            )}
            <AuthControls />
          </div>
        </div>
      </div>
    </header>
  );
}
