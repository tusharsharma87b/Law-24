import { Platform } from 'react-native';

/**
 * Centralized API base URL resolver.
 * Priority: EXPO_PUBLIC_API_URL -> EXPO_PUBLIC_API_BASE_URL -> platform defaults.
 */
function resolveBaseUrl(): string {
  const explicitUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  const explicitBase = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();

  if (explicitUrl) return explicitUrl.replace(/\/$/, '');
  if (explicitBase) return explicitBase.replace(/\/$/, '');

  return (
    Platform.select({
      android: 'http://10.0.2.2:4000',
      web: 'http://localhost:4000',
      ios: 'http://localhost:4000',
      default: 'http://localhost:4000',
    }) ?? 'http://localhost:4000'
  );
}

export const BASE_URL = resolveBaseUrl();
