import React, { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';

import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthUnauthorizedSync } from './auth-unauthorized-sync';
import { BASE_URL } from '../src/config/api';
import { useAuthStore } from '../store/useAuthStore';
import FloatingAIButton from '@/components/ui/FloatingAIButton';

const IS_WEB = Platform.OS === 'web';
const MOBILE_MAX_WIDTH = 430;


const StackScreens = () => (
  <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0D1117' } }}>
    <Stack.Screen name="index" />
    <Stack.Screen name="(auth)" />
    <Stack.Screen name="(tabs)" />
    <Stack.Screen name="profile" />
    <Stack.Screen name="nyaya" options={{ presentation: 'modal' }} />
    <Stack.Screen name="nyaya-notice" options={{ presentation: 'modal' }} />
    <Stack.Screen name="legal-search" />
    <Stack.Screen name="legal-categories" />
    <Stack.Screen name="categories/[id]" />
    <Stack.Screen name="legal-subcategory/[categoryId]" />
    <Stack.Screen name="legal-detail/[categoryId]/[subId]" />
    <Stack.Screen name="smart-legal-search" />
    <Stack.Screen name="lawyer/[id]" />
    <Stack.Screen name="payment" />
    <Stack.Screen name="case/[id]" />
  </Stack>
);

export default function RootLayout() {
  const segments = useSegments();
  const router = useRouter();
  const { user, isHydrated } = useAuthStore();
  const [isMounted, setIsMounted] = React.useState(false);

  useEffect(() => {
    setIsMounted(true);
    console.log('[Law24] API BASE_URL:', BASE_URL);
    useAuthStore.getState().hydrate();
  }, []);

  useEffect(() => {
    if (!isHydrated || !isMounted) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inSearchGroup = segments[0] === 'nyaya' || segments[0] === 'smart-legal-search' || segments[0] === 'legal-search';
    const showFAB = !inAuthGroup && !inSearchGroup;

    if (!user && !inAuthGroup) {
      // Not logged in -> force login
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      // Logged in -> move out of auth screens
      router.replace('/(tabs)');
    }
  }, [user, segments, isHydrated, isMounted]);

  const inAuthGroup = segments[0] === '(auth)';
  const inSearchGroup = segments[0] === 'nyaya' || segments[0] === 'smart-legal-search' || segments[0] === 'legal-search';
  const showFAB = !inAuthGroup && !inSearchGroup;

  if (!IS_WEB) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <AuthUnauthorizedSync />
          <StatusBar style="light" backgroundColor="#0D1117" />
          <StackScreens />
          {/* Global floating AI button — mounted OUTSIDE Stack so it overlays all screens */}
          {showFAB && <FloatingAIButton />}
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#050A14' }}>
      <SafeAreaProvider>
        <AuthUnauthorizedSync />
        <StatusBar style="light" backgroundColor="#0D1117" />
        <View style={styles.webOuter}>
          <View style={styles.webPhone}>
            <StackScreens />
            {/* Global floating AI button — inside the phone frame for web */}
            {showFAB && <FloatingAIButton />}
          </View>
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  webOuter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#050A14',
  },
  webPhone: {
    flex: 1,
    width: '100%',
    maxWidth: MOBILE_MAX_WIDTH,
    backgroundColor: '#0D1117',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 48,
    elevation: 20,
  },
});
