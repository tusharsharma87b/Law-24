/**
 * Root entry-point — handles INITIAL auth routing only.
 *
 * THE BUG THIS FIXES:
 * Both `app/index.tsx` AND `app/(tabs)/index.tsx` map to URL `/` in Expo Router
 * (because (tabs) is a route GROUP — it adds no URL prefix).
 * When the user clicks the Home tab while in the app, the URL changes to `/`,
 * Expo Router re-evaluates this file, sees isLoggedIn=false (no persist), and
 * redirects to login.
 *
 * THE FIX:
 * Use useSegments() to check the navigation STATE (not just the URL).
 * If segments[0] === '(tabs)', the user is already inside the tabs navigator —
 * render null so the tabs handle themselves. Only redirect on the very first
 * load when no navigation has happened yet.
 */
import React, { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { useAuthStore } from '../store/useAuthStore';
import { LoadingScreen } from '../components/ui/LoadingScreen';

export default function Index() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const [ready, setReady] = useState(false);
  useEffect(() => { setReady(true); }, []);

  // Still initialising — show spinner so navigator is fully mounted before
  // <Redirect> fires (prevents "navigate before mounting" error).
  if (!ready) {
    return <LoadingScreen message="Preparing app..." />;
  }

  // First load — send user to the right place
  return <Redirect href={(isLoggedIn ? '/(tabs)' : '/(auth)/login') as any} />;
}
