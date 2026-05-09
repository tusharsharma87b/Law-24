/**
 * Root entry-point — handles INITIAL auth routing only.
 *
 * HYDRATION FIX:
 * We gate on `isHydrated` (set by `hydrate()` in _layout.tsx) so we NEVER
 * fire a <Redirect> before AsyncStorage has been read.
 *
 * Before this fix: restoringSession started as false → immediate redirect to
 * login before the token was loaded → login bounce-back loop.
 */
import React from 'react';
import { Redirect } from 'expo-router';
import { useAuthStore } from '../store/useAuthStore';
import { LoadingScreen } from '../components/ui/LoadingScreen';

export default function Index() {
  const user         = useAuthStore((s) => s.user);
  const isHydrated   = useAuthStore((s) => s.isHydrated);

  // Wait for AsyncStorage read to complete.
  if (!isHydrated) {
    return <LoadingScreen message="Preparing app..." />;
  }

  // index.tsx is just a shell; the actual routing logic is now in app/_layout.tsx 
  // via segments and auth-store state checks.
  return null;
}
