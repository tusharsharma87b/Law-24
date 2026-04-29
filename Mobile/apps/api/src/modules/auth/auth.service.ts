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
    return { success: true, expiresInSec: 300 };
  }

  async verifyOtp(input: unknown, meta: { ipAddress?: string; userAgent?: string }) {
    const data = verifyOtpSchema.parse(input);
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
