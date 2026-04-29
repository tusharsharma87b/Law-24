import { z } from 'zod';
import { signAccessToken, signRefreshToken } from '../../lib/auth.js';
import { AuditRepository } from '../audit/audit.repository.js';
import { AuthRepository } from './auth.repository.js';

const sendOtpSchema = z.object({
  target: z.string().min(3),
  channel: z.enum(['phone', 'email']),
  purpose: z.enum(['login', 'verify_phone', 'verify_email']),
  name: z.string().min(2).optional(),
});

const verifyOtpSchema = z.object({
  target: z.string().min(3),
  code: z.string().length(6),
  purpose: z.enum(['login', 'verify_phone', 'verify_email']),
  deviceId: z.string().optional(),
});

const providerLoginSchema = z.object({
  provider: z.enum(['otp', 'google', 'email', 'truecaller']),
  data: z.record(z.unknown()).default({}),
});

export class AuthService {
  constructor(
    private readonly repo = new AuthRepository(),
    private readonly audit = new AuditRepository()
  ) {}

  async sendOtp(input: unknown) {
    const data = sendOtpSchema.parse(input);
    const code = `${Math.floor(100000 + Math.random() * 900000)}`;
    await this.repo.createOtp(data.target, code, data.purpose);
    await this.audit.log({ action: 'OTP_SENT', entity: 'auth', metadata: { target: data.target, purpose: data.purpose } });
    if (process.env.NODE_ENV !== 'production') {
      return { success: true, devOtp: code, expiresInSec: 300 };
    }
    return { success: true, expiresInSec: 300 };
  }

  async verifyOtp(input: unknown, meta: { ipAddress?: string; userAgent?: string }) {
    const raw = input as Record<string, unknown>;
    const normalizedInput = {
      target: String(raw.target ?? raw.phone ?? ''),
      code: String(raw.code ?? raw.otp ?? ''),
      purpose: String(raw.purpose ?? 'login'),
      deviceId: raw.deviceId as string | undefined,
    };
    const data = verifyOtpSchema.parse(normalizedInput);

    const otp = await this.repo.latestOtp(data.target, data.purpose);
    if (!otp || otp.verifiedAt || otp.expiresAt < new Date() || otp.code !== data.code) {
      throw new Error('Invalid or expired OTP');
    }
    await this.repo.markOtpVerified(otp.id);

    const existing = data.target.includes('@')
      ? await this.repo.findUserByEmail(data.target)
      : await this.repo.findUserByPhone(data.target);
    const user = existing ?? await this.repo.createUser({
      name: data.target.includes('@') ? 'Law24 User' : `User ${data.target.slice(-4)}`,
      email: data.target.includes('@') ? data.target : undefined,
      phone: data.target.includes('@') ? undefined : data.target,
      role: 'USER',
    });

    const accessToken = signAccessToken({ sub: user.id, role: user.role as 'USER' | 'LAWYER' | 'ADMIN' });
    const refreshToken = signRefreshToken({ sub: user.id, role: user.role as 'USER' | 'LAWYER' | 'ADMIN' });
    await this.repo.saveSession({
      userId: user.id,
      refreshToken,
      deviceId: data.deviceId,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });
    await this.audit.log({ userId: user.id, action: 'LOGIN_SUCCESS', entity: 'auth' });

    return { accessToken, refreshToken, user: { id: user.id, name: user.name, role: user.role } };
  }

  async login(
    input: unknown,
    meta: { ipAddress?: string; userAgent?: string }
  ): Promise<{ token: string; user: { id: string; name: string; phone?: string | null; email?: string | null; role: string } }> {
    const payload = providerLoginSchema.parse(input);

    if (payload.provider === 'otp') {
      const otpResult = await this.verifyOtp(
        {
          target: String(payload.data.target ?? payload.data.phone ?? ''),
          code: String(payload.data.code ?? payload.data.otp ?? ''),
          purpose: 'login',
          deviceId: payload.data.deviceId,
        },
        meta
      );
      const token = (otpResult as any).token ?? (otpResult as any).accessToken;
      if (!token) throw new Error('Token generation failed');
      return {
        token,
        user: {
          id: (otpResult as any).user.id,
          name: (otpResult as any).user.name,
          phone: (otpResult as any).user.phone ?? null,
          email: (otpResult as any).user.email ?? null,
          role: (otpResult as any).user.role,
        },
      };
    }

    if (process.env.NODE_ENV === 'production') {
      throw new Error(`${payload.provider} provider is not enabled yet`);
    }

    const providerName = payload.provider;
    const mockTarget =
      String(payload.data.email ?? payload.data.phone ?? `${providerName}.dev@law24.local`);
    const existing = mockTarget.includes('@')
      ? await this.repo.findUserByEmail(mockTarget)
      : await this.repo.findUserByPhone(mockTarget);
    const user = existing ?? await this.repo.createUser({
      name: `Test ${providerName[0].toUpperCase()}${providerName.slice(1)} User`,
      email: mockTarget.includes('@') ? mockTarget : undefined,
      phone: mockTarget.includes('@') ? undefined : mockTarget,
      role: 'USER',
    });
    const token = signAccessToken({ sub: user.id, role: user.role as 'USER' | 'LAWYER' | 'ADMIN' });
    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
      },
    };
  }

  async getMe(userId: string) {
    const user = await this.repo.findUserById(userId);
    if (!user) throw new Error('User not found');
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    };
  }
}
