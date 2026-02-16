import { ReactNode } from 'react';
import NavBar from './NavBar';
import Footer from './Footer';
import FloatingActionButton from './FloatingActionButton';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NavBar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        {children}
      </main>
      <Footer />
      <FloatingActionButton />
    </div>
  );
}
