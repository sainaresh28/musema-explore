import { useEffect } from 'react';
import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-react';
import { setTokenProvider } from '../api/client';
import { authApi } from '../api/auth.api';

export const ClerkTokenSync = () => {
  const { getToken, isLoaded: authLoaded } = useClerkAuth();
  const { user, isSignedIn, isLoaded: userLoaded } = useUser();

  useEffect(() => {
    if (!authLoaded) return;
    setTokenProvider(() => getToken());
  }, [getToken, authLoaded]);

  useEffect(() => {
    if (!userLoaded || !authLoaded) return;  
    if (!isSignedIn || !user) return;

    authApi.syncUser({
      fullName: user.fullName || user.firstName || '',
      email: user.primaryEmailAddress?.emailAddress || '',
    }).catch(() => {
      
    });
  }, [isSignedIn, user, userLoaded, authLoaded]);

  return null;
};

export { useUser, useClerkAuth as useClerkAuthHook };
