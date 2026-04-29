import { Router } from 'express';
import { prisma } from '../../lib/prisma.js';
import { requireAuth } from '../../middleware/auth.js';

export const lawyersRouter = Router();

lawyersRouter.get('/', async (_req, res) => {
  const rows = await prisma.lawyer.findMany({
    orderBy: { rating: 'desc' },
    take: 100,
  });
  res.json(rows);
});

lawyersRouter.get('/match', requireAuth, async (req, res) => {
  const caseType = String(req.query.caseType ?? '').toLowerCase();
  const state = String(req.query.state ?? '').toLowerCase();
  const rows = await prisma.lawyer.findMany({
    where: {
      specialization: caseType ? { contains: caseType, mode: 'insensitive' } : undefined,
      state: state ? { contains: state, mode: 'insensitive' } : undefined,
      availability: true,
    },
    orderBy: { pricePerMin: 'asc' },
    take: 12,
  });
  const bucket = [
    rows[0],
    rows[Math.floor(rows.length / 2)],
    rows[rows.length - 1],
  ].filter(Boolean);
  res.json({
    budget: bucket[0] ?? null,
    mid: bucket[1] ?? bucket[0] ?? null,
    premium: bucket[2] ?? bucket[1] ?? bucket[0] ?? null,
  });
});
