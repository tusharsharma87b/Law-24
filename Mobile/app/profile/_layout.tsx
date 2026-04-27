import React from 'react';
import { Stack } from 'expo-router';

export default function ProfileStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="update-contact" />
      <Stack.Screen name="change-password" />
      <Stack.Screen name="device-list" />
      <Stack.Screen name="login-history" />
      <Stack.Screen name="plans" />
      <Stack.Screen name="add-money" />
      <Stack.Screen name="invoice-list" />
      <Stack.Screen name="case-timeline" />
      <Stack.Screen name="chat-screen" />
      <Stack.Screen name="faq" />
      <Stack.Screen name="support-center" />
    </Stack>
  );
}

