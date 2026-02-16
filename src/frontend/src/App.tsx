import { useState, useEffect } from 'react';
import { RouterProvider, createRouter, createRootRoute, createRoute, Outlet } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import SplashScreen from './components/SplashScreen';
import AppLayout from './components/AppLayout';
import HomePage from './pages/HomePage';
import ShortsPage from './pages/ShortsPage';
import UploadPage from './pages/UploadPage';
import WatchPage from './pages/WatchPage';
import LivePage from './pages/LivePage';
import LiveDetailsPage from './pages/LiveDetailsPage';

function Layout() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}

const rootRoute = createRootRoute({
  component: Layout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const shortsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/shorts',
  component: ShortsPage,
});

const uploadRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/upload',
  component: UploadPage,
});

const watchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/watch/$title',
  component: WatchPage,
});

const liveRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/live',
  component: LivePage,
});

const liveDetailsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/live/$title',
  component: LiveDetailsPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  shortsRoute,
  uploadRoute,
  watchRoute,
  liveRoute,
  liveDetailsRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
