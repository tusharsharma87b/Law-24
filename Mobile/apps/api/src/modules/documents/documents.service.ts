import { prisma } from '../../lib/prisma.js';

export class DocumentsService {
  async getAllDocuments(userId: string) {
    return prisma.document.findMany({
      where: { case: { userId } },
      include: { case: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getDocumentsByCaseId(caseId: string, userId: string) {
    const caseExists = await prisma.case.findUnique({
      where: { id: caseId },
      select: { id: true, userId: true },
    });

    if (!caseExists) {
      throw Object.assign(new Error('Case not found'), { status: 404 });
    }
    if (caseExists.userId !== userId) {
      throw Object.assign(new Error('Unauthorized'), { status: 401 });
    }

    return prisma.document.findMany({
      where: { caseId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
