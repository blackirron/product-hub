import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';

import { AppLayout } from '@/components/layout/AppLayout';
import Home from '@/pages/Home';
import Explore from '@/pages/Explore';
import DeckDetail from '@/pages/DeckDetail';
import UploadDeck from '@/pages/UploadDeck';
import Courses from '@/pages/Courses';
import Events from '@/pages/Events';
import Network from '@/pages/Network';
import Profile from '@/pages/Profile';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/explore" component={Explore} />
        <Route path="/decks/:id" component={DeckDetail} />
        <Route path="/upload" component={UploadDeck} />
        <Route path="/courses" component={Courses} />
        <Route path="/events" component={Events} />
        <Route path="/network" component={Network} />
        <Route path="/profile/:id" component={Profile} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;