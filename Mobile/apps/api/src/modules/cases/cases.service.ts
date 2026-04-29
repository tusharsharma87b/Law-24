import { prisma } from '../../lib/prisma.js';

export class CasesService {
  getCasesByUserId(userId: string) {
    return prisma.case.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
