import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../config/api';

const TOKEN_KEY = 'law24_access_token';
const LEGACY_TOKEN_KEY = 'token';

type UnauthorizedCallback = () => void;
const unauthorizedListeners = new Set<UnauthorizedCallback>();

/** Call from a root/component once — clears session + navigates away on API 401 (when a token was sent). */
export function subscribeUnauthorized(callback: UnauthorizedCallback): () => void {
  unauthorizedListeners.add(callback);
  return () => unauthorizedListeners.delete(callback);
}

function emitUnauthorized(): void {
  unauthorizedListeners.forEach((cb) => {
    try {
      cb();
    } catch {
      /* ignore */
    }
  });
}

function normalizeEndpoint(endpoint: string): string {
  if (endpoint.startsWith('/api/v1/')) return endpoint;
  const withSlash = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `/api/v1${withSlash}`;
}

function shouldAttachAuth(normalizedPath: string, token: string | null): boolean {
  if (!token || token.length === 0) return false;
  // OTP and login-ish routes must NOT send a stale Bearer from a prior session — it breaks verify flows on some gateways.
  if (normalizedPath.includes('/auth/send-otp') || normalizedPath.includes('/auth/verify-otp')) {
    return false;
  }
  return true;
}

async function getToken(): Promise<string | null> {
  let raw = await AsyncStorage.getItem(TOKEN_KEY);
  if (!raw) {
    const legacy = await AsyncStorage.getItem(LEGACY_TOKEN_KEY);
    if (legacy?.trim()) {
      raw = legacy;
      await AsyncStorage.setItem(TOKEN_KEY, legacy.trim());
      await AsyncStorage.removeItem(LEGACY_TOKEN_KEY);
    }
  }
  const t = raw?.trim();
  return t?.length ? t : null;
}

export async function getStoredAccessToken(): Promise<string | null> {
  return getToken();
}

async function parseJsonBody(res: Response): Promise<{ data: unknown; message?: string }> {
  const text = await res.text();
  if (!text) return { data: null };
  try {
    const parsed = JSON.parse(text) as Record<string, unknown>;
    const message = typeof parsed?.message === 'string' ? parsed.message : undefined;
    return { data: parsed, message };
  } catch {
    return { data: null };
  }
}

async function request(method: 'GET' | 'POST', endpoint: string, body?: unknown) {
  const token = await getToken();
  const path = normalizeEndpoint(endpoint);
  const sendAuth = shouldAttachAuth(path, token);

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(sendAuth && token ? { Authorization: `Bearer ${token.replace(/^Bearer\s+/i, '')}` } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  const { data, message } = await parseJsonBody(res);

  const isAuthMe =
    path === '/api/v1/auth/me' ||
    path.endsWith('/auth/me');

  // Stale or invalid JWT: clear storage and optionally notify listeners (logged-in UX).
  if (res.status === 401 && sendAuth && token) {
    await clearAccessToken();
    if (!isAuthMe) {
      emitUnauthorized();
    }
  }

  if (isAuthMe && res.status === 401) {
    return null;
  }

  if (!res.ok) {
    throw new Error(message ?? `Request failed: ${res.status}`);
  }

  return data;
}

export async function apiGet(endpoint: string) {
  return request('GET', endpoint);
}

export async function apiPost(endpoint: string, body: unknown) {
  return request('POST', endpoint, body);
}

export async function saveAccessToken(token: string): Promise<void> {
  const t = typeof token === 'string' ? token.trim().replace(/^Bearer\s+/i, '') : '';
  if (!t) throw new Error('Cannot save empty access token');
  await AsyncStorage.setItem(TOKEN_KEY, t);
  await AsyncStorage.removeItem(LEGACY_TOKEN_KEY);
}

export async function clearAccessToken(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
  await AsyncStorage.removeItem(LEGACY_TOKEN_KEY);
}

export const testConnection = async () => {
  try {
    const res = await fetch(`${BASE_URL}/health`);
    const data = await res.json().catch(() => null);
    console.log('HEALTH CHECK SUCCESS:', data);
  } catch (err) {
    console.error('HEALTH CHECK FAILED:', BASE_URL, err);
  }
};
