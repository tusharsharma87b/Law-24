import { prisma } from '../../lib/prisma.js';

export class AuditRepository {
  log(input: { userId?: string; action: string; entity: string; entityId?: string; metadata?: unknown }) {
    return prisma.auditLog.create({
      data: {
        action: input.action,
        entity: input.entity,
        entityId: input.entityId,
        metadata: input.metadata as object | undefined,
        user: input.userId ? { connect: { id: input.userId } } : undefined,
      },
    });
  }
}
