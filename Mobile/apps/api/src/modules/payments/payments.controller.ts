import crypto from 'crypto';
import { Router } from 'express';
import Razorpay from 'razorpay';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { env } from '../../config/env.js';
import { prisma } from '../../lib/prisma.js';
import { requireAuth, type AuthRequest } from '../../middleware/auth.js';
import { AuditRepository } from '../audit/audit.repository.js';

export const paymentsRouter = Router();
const audit = new AuditRepository();

const razorpay = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET,
});

const createOrderSchema = z.object({
  amount: z.number().min(10).max(50000),
  currency: z.literal('INR').default('INR'),
  idempotencyKey: z.string().min(8),
});

paymentsRouter.get('/wallet', requireAuth, async (req: AuthRequest, res) => {
  const wallet = await prisma.wallet.findUnique({ where: { userId: req.user!.id } });
  const txns = await prisma.transaction.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  res.json({ wallet, transactions: txns });
});

paymentsRouter.post('/order', requireAuth, async (req: AuthRequest, res) => {
  try {
    const body = createOrderSchema.parse(req.body);
    const existing = await prisma.transaction.findUnique({ where: { idempotencyKey: body.idempotencyKey } });
    if (existing) {
      res.json({ reused: true, transactionId: existing.id, referenceId: existing.referenceId });
      return;
    }
    const order = await razorpay.orders.create({
      amount: Math.round(body.amount * 100),
      currency: body.currency,
      receipt: `law24_${Date.now()}`,
      notes: { userId: req.user!.id },
    });
    const txn = await prisma.transaction.create({
      data: {
        userId: req.user!.id,
        type: 'CREDIT',
        amount: new Prisma.Decimal(body.amount),
        source: 'RAZORPAY',
        status: 'PENDING',
        referenceId: order.id,
        idempotencyKey: body.idempotencyKey,
      },
    });
    res.json({ orderId: order.id, amount: body.amount, transactionId: txn.id, keyId: env.RAZORPAY_KEY_ID });
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

paymentsRouter.post('/verify', requireAuth, async (req: AuthRequest, res) => {
  const body = z.object({
    razorpayOrderId: z.string(),
    razorpayPaymentId: z.string(),
    razorpaySignature: z.string(),
  }).parse(req.body);

  const digest = crypto
    .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
    .update(`${body.razorpayOrderId}|${body.razorpayPaymentId}`)
    .digest('hex');

  if (digest !== body.razorpaySignature) {
    res.status(400).json({ message: 'Invalid payment signature' });
    return;
  }

  const txn = await prisma.transaction.findFirst({
    where: { userId: req.user!.id, referenceId: body.razorpayOrderId, status: 'PENDING' },
  });
  if (!txn) {
    res.status(404).json({ message: 'Pending transaction not found' });
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.transaction.update({ where: { id: txn.id }, data: { status: 'SUCCESS', referenceId: body.razorpayPaymentId } });
    const wallet = await tx.wallet.findUnique({ where: { userId: req.user!.id } });
    if (!wallet) throw new Error('Wallet missing');
    await tx.wallet.update({
      where: { userId: req.user!.id },
      data: { balance: wallet.balance.plus(txn.amount) },
    });
  });

  await audit.log({
    userId: req.user!.id,
    action: 'PAYMENT_SUCCESS',
    entity: 'transaction',
    entityId: txn.id,
    metadata: { orderId: body.razorpayOrderId, paymentId: body.razorpayPaymentId },
  });

  res.json({ success: true });
});
