import React, { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthUnauthorizedSync } from './auth-unauthorized-sync';
import { BASE_URL } from '../src/config/api';

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
    <Stack.Screen name="legal-subcategory/[categoryId]" />
    <Stack.Screen name="legal-detail/[categoryId]/[subId]" />
    <Stack.Screen name="smart-legal-search" />
    <Stack.Screen name="lawyer/[id]" />
    <Stack.Screen name="payment" />
    <Stack.Screen name="case/[id]" />
  </Stack>
);

export default function RootLayout() {
  useEffect(() => {
    console.log('[Law24] API BASE_URL:', BASE_URL);
  }, []);

  if (!IS_WEB) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <AuthUnauthorizedSync />
          <StatusBar style="light" backgroundColor="#0D1117" />
          <StackScreens />
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
