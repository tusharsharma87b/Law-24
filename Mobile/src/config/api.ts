import { Platform } from 'react-native';

/**
 * Centralized API base URL resolver.
 * Priority: EXPO_PUBLIC_API_URL -> EXPO_PUBLIC_API_BASE_URL -> platform defaults.
 * 
 * For testing on physical devices:
 * - Set EXPO_PUBLIC_API_URL=http://192.168.31.13:4000 (your system IP)
 * 
 * Android emulator: uses 10.0.2.2 to reach host
 * iOS simulator: uses localhost
 * Web: uses localhost
 * Physical devices: needs your actual machine IP
 */
function resolveBaseUrl(): string {
  const explicitUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  const explicitBase = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();

  if (explicitUrl) {
    console.log('[API Config] Using explicit URL:', explicitUrl);
    return explicitUrl.replace(/\/$/, '');
  }
  if (explicitBase) {
    console.log('[API Config] Using explicit base:', explicitBase);
    return explicitBase.replace(/\/$/, '');
  }

  const defaultUrl = Platform.select({
    android: 'http://10.0.2.2:4000',
    web: 'http://localhost:4000',
    ios: 'http://localhost:4000',
    default: 'http://localhost:4000',
  }) ?? 'http://localhost:4000';

  console.log('[API Config] Using platform default:', defaultUrl, 'on', Platform.OS);
  return defaultUrl;
}

export const BASE_URL = resolveBaseUrl();

// For debugging: log the resolved URL once on startup
if (typeof __DEV__ !== 'undefined' && __DEV__) {
  console.log('[Law24] API_BASE_URL =', BASE_URL);
}
