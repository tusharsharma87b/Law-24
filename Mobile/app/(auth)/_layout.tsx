import React from 'react';
import { Stack } from 'expo-router';

// Auth redirects are handled by app/index.tsx — not here.
// Adding <Redirect> inside this layout can cause "navigate before mounting"
// errors on web SPA mode.
export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0D1117' } }} />
  );
}
