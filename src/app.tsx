import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ClerkTokenSync } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';

const queryClient = new QueryClient();

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY in your .env file');
}

const App = () => (
  <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/sign-in">
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {/* Syncs Clerk token & user into our backend */}
        <ClerkTokenSync />
        <Toaster richColors position="top-right" />
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  </ClerkProvider>
);

export default App;
