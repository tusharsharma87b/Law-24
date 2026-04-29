import React from 'react';
import { Stack } from 'expo-router';

export default function ProfileStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="update-contact" />
      <Stack.Screen name="change-password" />
      <Stack.Screen name="delete-account" />
      <Stack.Screen name="device-list" />
      <Stack.Screen name="login-history" />
      <Stack.Screen name="add-money" />
      <Stack.Screen name="invoice-list" />
      <Stack.Screen name="case-timeline" />
      <Stack.Screen name="chat-screen" />
      <Stack.Screen name="chat-history" />
      <Stack.Screen name="faq" />
      <Stack.Screen name="live-chat" />
      <Stack.Screen name="chat-support" />
      <Stack.Screen name="about-us" />
      <Stack.Screen name="buy-credits" />
      <Stack.Screen name="download-data" />
      <Stack.Screen name="support-center" />
    </Stack>
  );
}
