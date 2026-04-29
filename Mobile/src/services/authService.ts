import { apiGet, apiPost } from './api';

type VerifyOtpResponse = {
  success?: boolean;
  verifySuccess?: boolean;
  accessToken?: string;
  token?: string;
  user?: {
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
  const data = await apiPost('/auth/send-otp', {
    target: target.trim(),
    channel,
    purpose: 'login',
  });
  return data as SendOtpResponse;
}

export async function verifyOtp(target: string, code: string): Promise<VerifyOtpResponse> {
  const res = await apiPost('/auth/verify-otp', {
    target: target.trim(),
    code: code.trim(),
    purpose: 'login',
  });

  console.log('VERIFY OTP RESPONSE:', res);

  return res as VerifyOtpResponse;
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
