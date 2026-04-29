import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { subscribeUnauthorized } from '../src/services/api';

/**
 * Registers a global listener: when any authenticated API returns 401, we wipe local session
 * and send the user to login (handles stale/expired JWT on device).
 */
export function AuthUnauthorizedSync() {
  const router = useRouter();

  useEffect(() => {
    return subscribeUnauthorized(() => {
      void (async () => {
        await useAuthStore.getState().logout();
        router.replace('/(auth)/login');
      })();
    });
  }, [router]);

  return null;
}
