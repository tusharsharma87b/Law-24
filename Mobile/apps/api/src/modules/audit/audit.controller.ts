import { Router } from 'express';
import { prisma } from '../../lib/prisma.js';
import { requireAuth, requireRole, type AuthRequest } from '../../middleware/auth.js';

export const auditRouter = Router();

auditRouter.get('/logs', requireAuth, requireRole(['ADMIN']), async (req: AuthRequest, res) => {
  const rows = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
  });
  res.json(rows);
});
