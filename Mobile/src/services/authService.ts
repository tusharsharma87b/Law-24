import { apiGet, apiPost } from './api';

type VerifyOtpResponse = {
  accessToken?: string;
  token?: string;
  user: {
    id: string;
    name: string;
    phone?: string | null;
    email?: string | null;
    role: string;
  };
};

/** Backend returns camelCase accessToken; some stacks use `token` — normalize. */
export function pickAccessToken(r: VerifyOtpResponse): string | null {
  const a = typeof r.accessToken === 'string' ? r.accessToken.trim() : '';
  if (a) return a.replace(/^Bearer\s+/i, '');
  const b = typeof r.token === 'string' ? r.token.trim() : '';
  return b.replace(/^Bearer\s+/i, '') || null;
}

type SendOtpResponse = {
  success: boolean;
  expiresInSec: number;
  devOtp?: string;
};

export async function sendOtp(target: string, channel: 'phone' | 'email' = 'phone'): Promise<SendOtpResponse> {
  return apiPost('/auth/send-otp', {
    target,
    channel,
    purpose: 'login',
  });
}

export async function verifyOtp(target: string, code: string): Promise<VerifyOtpResponse> {
  const data = await apiPost('/auth/verify-otp', {
    target,
    code,
    purpose: 'login',
  });
  return data as VerifyOtpResponse;
}

export async function getMe() {
  return apiGet('/auth/me');
}

export async function loginWithGoogle(): Promise<never> {
  throw new Error('Coming Soon');
}

export async function loginWithEmail(): Promise<never> {
  throw new Error('Coming Soon');
}

export async function loginWithTruecaller(): Promise<never> {
  throw new Error('Coming Soon');
}
