import React from 'react';
import { Stack, Redirect } from 'expo-router';
import { useAuthStore } from '../../store/useAuthStore';

export default function AuthLayout() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  // Already logged in mid-session → go to the app
  if (isLoggedIn) return <Redirect href="/(tabs)" />;

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0D1117' } }} />
  );
}
