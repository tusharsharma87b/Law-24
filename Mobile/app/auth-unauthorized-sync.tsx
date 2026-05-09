import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { subscribeUnauthorized } from '../src/services/api';

/**
 * Registers a global listener: when any authenticated API returns 401, we wipe
 * local session and send the user to login.
 *
 * GUARD: Only fires if the store is already hydrated AND the token is still
 * present. This prevents a race where the listener fires immediately after login
 * before the state has settled (e.g. with the dev bypass token).
 */
export function AuthUnauthorizedSync() {
  const router = useRouter();

  useEffect(() => {
    return subscribeUnauthorized(() => {
      const state = useAuthStore.getState();
      // Do NOT logout if we are not yet hydrated, or if the user is not logged in.
      if (!state.isHydrated || !state.isLoggedIn) {
        console.log('[Law24] 401 received but user not logged in — skipping logout');
        return;
      }
      console.log('[Law24] 401 received on authenticated request — logging out');
      void (async () => {
        await state.logout();
        router.replace('/(auth)/login');
      })();
    });
  }, [router]);

  return null;
}
