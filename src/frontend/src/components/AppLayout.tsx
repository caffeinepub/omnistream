import { ReactNode } from 'react';
import NavBar from './NavBar';
import Footer from './Footer';
import FloatingActionButton from './FloatingActionButton';
import BackendUnavailableBanner from './BackendUnavailableBanner';
import { useActor } from '../hooks/useActor';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { actor, isFetching: actorFetching } = useActor();

  // Show banner if actor is unavailable after initialization
  const showUnavailableBanner = !actorFetching && !actor;

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
