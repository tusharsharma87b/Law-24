import { prisma } from '../../lib/prisma.js';

export class WalletService {
  getWalletByUserId(userId: string) {
    return prisma.wallet.findUnique({
      where: { userId },
    });
  }
}
