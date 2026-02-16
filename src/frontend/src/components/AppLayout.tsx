import { ReactNode } from 'react';
import NavBar from './NavBar';
import Footer from './Footer';
import FloatingActionButton from './FloatingActionButton';
import BackendUnavailableBanner from './BackendUnavailableBanner';
import { useActor } from '../hooks/useActor';
import { useGetForYouFeed } from '../hooks/useQueries';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { actor, isFetching: actorFetching } = useActor();
  
  // Use a query to detect if backend is unavailable
  const { isError: feedError, isFetching: feedFetching } = useGetForYouFeed();

  // Show banner if actor is null after fetching completes, or if queries consistently fail
  const showUnavailableBanner = !actorFetching && !actor && !feedFetching;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NavBar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        {showUnavailableBanner ? (
          <BackendUnavailableBanner />
        ) : (
          children
        )}
      </main>
      <Footer />
      <FloatingActionButton />
    </div>
  );
}
