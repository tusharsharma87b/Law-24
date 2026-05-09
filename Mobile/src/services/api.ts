import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../config/api';

const TOKEN_KEY = 'law24_access_token';
const LEGACY_TOKEN_KEY = 'token';

type UnauthorizedCallback = () => void;
const unauthorizedListeners = new Set<UnauthorizedCallback>();

/** Call from a root/component once; clears session + navigates away on API 401 when a token was sent. */
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

function isPublicOtpEndpoint(normalizedPath: string): boolean {
  return [
    '/api/v1/auth/send-otp',
    '/api/v1/auth/verify-otp',
    '/api/v1/auth/otp/send',
    '/api/v1/auth/otp/verify',
  ].includes(normalizedPath);
}

function shouldAttachAuth(normalizedPath: string, token: string | null): boolean {
  if (!token || token.length === 0) return false;
  return !isPublicOtpEndpoint(normalizedPath);
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
  try {
    const text = await res.text();
    console.log(`[API] Response status ${res.status} raw text (${text.length} chars):`, text.substring(0, 200));
    
    if (!text || text.trim() === '') {
      console.warn('[API] Empty response body');
      return { data: null, message: 'Empty response from server' };
    }
    
    try {
      const parsed = JSON.parse(text) as Record<string, unknown>;
      console.log('[API] Successfully parsed JSON:', JSON.stringify(parsed).substring(0, 200));
      const message = typeof parsed?.message === 'string' ? parsed.message : undefined;
      return { data: parsed, message };
    } catch (parseError) {
      console.error('[API] JSON parse error:', parseError, 'Text:', text.substring(0, 100));
      throw new Error(`Invalid JSON: ${(parseError as Error).message}`);
    }
  } catch (error) {
    console.error('[API] parseJsonBody error:', error);
    return { data: null, message: (error as Error).message };
  }
}


async function request(method: 'GET' | 'POST', endpoint: string, body?: unknown) {
  const token = await getToken();
  const path = normalizeEndpoint(endpoint);
  const sendAuth = shouldAttachAuth(path, token);
  const isOtpEndpoint = isPublicOtpEndpoint(path);

  const reqLog = {
    method,
    endpoint,
    path,
    url: `${BASE_URL}${path}`,
    isOtp: isOtpEndpoint,
    hasAuth: sendAuth && !!token,
    bodyKeys: body ? Object.keys(body as Record<string, unknown>) : [],
  };

  console.log('[API REQUEST]', JSON.stringify(reqLog, null, 2));

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(sendAuth && token ? { Authorization: `Bearer ${token.replace(/^Bearer\s+/i, '')}` } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });

    console.log('[API RESPONSE] Status:', res.status, 'URL:', res.url);

    const { data, message } = await parseJsonBody(res);

    const isAuthMe =
      path === '/api/v1/auth/me' ||
      path.endsWith('/auth/me');

    // 401 handling: log but DO NOT auto-logout.
    // Auto-logout was causing a bounce-back loop because the dev bypass token
    // ("dev_token_...") is not a signed JWT and any authenticated API call
    // immediately returns 401, triggering emitUnauthorized → logout → login redirect.
    // In production, swap this back to the stricter version.
    if (res.status === 401) {
      console.log('[Law24 API] 401 on', path, '— skipping auto-logout (dev mode)');
      if (isAuthMe) return null;
      // Don't throw — let callers handle gracefully.
      return null;
    }

    if (!res.ok) {
      const errorMsg = message ?? `Request failed: ${res.status}`;
      console.error('[API ERROR] Status:', res.status, 'Message:', errorMsg);
      throw new Error(errorMsg);
    }

    console.log('[API SUCCESS]', path, 'Data:', JSON.stringify(data).substring(0, 200));
    return data;
  } catch (error) {
    console.error('[API EXCEPTION]', path, error);
    throw error;
  }
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
