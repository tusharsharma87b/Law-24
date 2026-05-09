import { prisma } from '../../lib/prisma.js';

export class AuthRepository {
  findUserById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  }

  findUserByPhone(phone: string) {
    return prisma.user.findUnique({ where: { phone } });
  }

  findUserByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  createUser(data: { phone?: string; email?: string; name: string; role?: 'USER' | 'LAWYER' | 'ADMIN' }) {
    const fallbackEmail = `${(data.phone ?? Date.now().toString())}@placeholder.law24.local`;
    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email ?? fallbackEmail,
        phone: data.phone,
        role: data.role ?? 'USER',
        wallet: { create: { balance: 0 } },
        credits: { create: { dailyFreeLimit: 15, remainingToday: 15, purchasedCredits: 0, dayKey: new Date().toISOString().slice(0, 10) } },
      },
    });
  }

  createOtp(target: string, code: string, purpose: string, userId?: string) {
    return prisma.otpCode.create({
      data: {
        target,
        code,
        purpose,
        userId,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    });
  }

  latestOtp(target: string, purpose: string) {
    return prisma.otpCode.findFirst({ where: { target, purpose }, orderBy: { createdAt: 'desc' } });
  }

  markOtpVerified(id: string) {
    return prisma.otpCode.update({ where: { id }, data: { verifiedAt: new Date() } });
  }

  saveSession(data: { userId: string; refreshToken: string; deviceId?: string; userAgent?: string; ipAddress?: string }) {
    return prisma.session.create({
      data: {
        ...data,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
  }
}
