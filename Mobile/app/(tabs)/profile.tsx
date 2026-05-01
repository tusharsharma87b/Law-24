import React from 'react';
import ProfileHomeScreen from '../profile/ProfileHomeScreen';

export default function TabProfileScreen() {
  if (!ProfileHomeScreen) return null;
  return <ProfileHomeScreen />;
}
