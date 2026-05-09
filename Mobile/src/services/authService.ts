import { apiGet, apiPost } from './api';

// Enable mock OTP in development for testing
const USE_MOCK_OTP = __DEV__ && true; // Set to false to use real API

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
  // Mock OTP for development
  if (USE_MOCK_OTP) {
    console.log('[AuthService] Using mock OTP for development');
    const mockOtp = '123456';
    const mockResponse: SendOtpResponse = {
      success: true,
      expiresInSec: 300,
      devOtp: mockOtp,
    };
    console.log('[AuthService] Mock OTP response:', mockResponse);
    return mockResponse;
  }

  try {
    console.log('[AuthService] Sending OTP to:', target, 'channel:', channel);
    
    const payload = {
      target: target.trim(),
      channel,
      purpose: 'login',
    };
    
    console.log('[AuthService] SendOTP payload:', JSON.stringify(payload));
    
    const data = await apiPost('/auth/send-otp', payload);
    
    if (!data) {
      throw new Error('No response from server');
    }
    
    console.log('[AuthService] SendOTP response:', JSON.stringify(data).substring(0, 200));
    
    if (!(data as any).success) {
      throw new Error((data as any).message || 'OTP request failed');
    }
    
    return data as SendOtpResponse;
  } catch (error) {
    console.error('[AuthService] sendOtp error:', error);
    throw error;
  }
}

export async function verifyOtp(target: string, code: string): Promise<VerifyOtpResponse> {
  try {
    console.log('[AuthService] Verifying OTP for target:', target);
    
    const payload = {
      target: target.trim(),
      code: code.trim(),
      purpose: 'login',
    };
    
    console.log('[AuthService] VerifyOTP payload:', JSON.stringify(payload));
    
    const res = await apiPost('/auth/verify-otp', payload);
    
    console.log('[AuthService] VERIFY OTP RESPONSE:', JSON.stringify(res).substring(0, 300));
    
    if (!res) {
      throw new Error('No response from server');
    }

    const response = res as VerifyOtpResponse;
    
    // Check for success indicators
    const hasSuccess = response?.success || response?.verifySuccess;
    if (!hasSuccess && !pickAccessToken(response)) {
      throw new Error(response ? 'OTP verification failed' : 'Invalid server response');
    }

    return response;
  } catch (error) {
    console.error('[AuthService] verifyOtp error:', error);
    throw error;
  }
}

export async function getMe() {
  try {
    console.log('[AuthService] Fetching current user');
    const data = await apiGet('/auth/me');
    console.log('[AuthService] getMe response:', data);
    return data;
  } catch (error) {
    console.error('[AuthService] getMe error:', error);
    throw error;
  }
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
