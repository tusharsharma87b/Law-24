import React, { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { FloatingFAB } from './components/ui/FloatingFAB';

const IS_WEB = Platform.OS === 'web';
const MOBILE_MAX_WIDTH = 420;

const StackScreens = () => (
  <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0D1117' } }}>
    <Stack.Screen name="index" />
    <Stack.Screen name="(auth)" />
    <Stack.Screen name="(tabs)" />
    <Stack.Screen name="nyaya" options={{ presentation: 'modal' }} />
    <Stack.Screen name="lawyer/[id]" />
    <Stack.Screen name="payment" />
    <Stack.Screen name="case/[id]" />
    <Stack.Screen name="departments" />
    <Stack.Screen name="department/[id]" />
    <Stack.Screen name="chat/[id]" />
    <Stack.Screen name="profile" />
  </Stack>
);

export default function RootLayout() {
  useEffect(() => {
    if (IS_WEB && typeof document !== 'undefined') {
      document.body.style.overflowX = 'hidden';
    }
  }, []);

  if (!IS_WEB) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <StatusBar style="light" backgroundColor="#0D1117" />
          <View style={styles.appContainer}>
            <StackScreens />
            <FloatingFAB />
          </View>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#050A14' }}>
      <SafeAreaProvider>
        <StatusBar style="light" backgroundColor="#0D1117" />
        <View style={styles.webOuter}>
          <View style={styles.webPhone}>
            <StackScreens />
            <FloatingFAB />
          </View>
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    width: '100%',
    maxWidth: MOBILE_MAX_WIDTH,
    alignSelf: 'center',
    flex: 1,
    position: 'relative',
    backgroundColor: '#020617',
    overflow: 'hidden',
  },
  webOuter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#050A14',
  },
  webPhone: {
    width: '100%',
    maxWidth: MOBILE_MAX_WIDTH,
    flex: 1,
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#0B1220',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 48,
    elevation: 20,
  },
});
