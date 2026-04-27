import React, { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const IS_WEB = Platform.OS === 'web';
const MOBILE_MAX_WIDTH = 430;

const StackScreens = () => (
  <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0D1117' } }}>
    <Stack.Screen name="index" />
    <Stack.Screen name="(auth)" />
    <Stack.Screen name="(tabs)" />
    <Stack.Screen name="nyaya" options={{ presentation: 'modal' }} />
    <Stack.Screen name="lawyer/[id]" />
    <Stack.Screen name="payment" />
    <Stack.Screen name="case/[id]" />
  </Stack>
);

export default function RootLayout() {
  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7558/ingest/e2a760d8-9665-4f24-a1b8-077894e54057',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'a08cc0'},body:JSON.stringify({sessionId:'a08cc0',runId:'mobile-boot',hypothesisId:'H25',location:'app/_layout.tsx:25',message:'Root layout mounted',data:{platform:Platform.OS},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
  }, []);

  if (!IS_WEB) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <StatusBar style="light" backgroundColor="#0D1117" />
          <StackScreens />
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
