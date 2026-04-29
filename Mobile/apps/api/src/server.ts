import cors from 'cors';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { env } from './config/env.js';
import { usersRouter } from './modules/users/users.routes.js';
import { walletRouter } from './modules/wallet/wallet.routes.js';
import { casesRouter } from './modules/cases/cases.routes.js';
import { documentsRouter } from './modules/documents/documents.routes.js';
import { aiRouter } from './modules/ai/ai.controller.js';
import { authRouter } from './modules/auth/auth.controller.js';
import { paymentsRouter } from './modules/payments/payments.controller.js';
import { lawyersRouter } from './modules/lawyers/lawyers.controller.js';
import { notificationsRouter } from './modules/notifications/notifications.controller.js';
import { auditRouter } from './modules/audit/audit.controller.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/payments', paymentsRouter);
app.use('/api/v1/lawyers', lawyersRouter);
app.use('/api/v1/notifications', notificationsRouter);
app.use('/api/v1/audit', auditRouter);

app.use('/api/v1', usersRouter);
app.use('/api/v1', walletRouter);
app.use('/api/v1', casesRouter);
app.use('/api/v1', documentsRouter);
app.use('/api/v1', aiRouter);

io.on('connection', (socket) => {
  socket.on('join:user', (userId: string) => socket.join(`user:${userId}`));
  socket.on('disconnect', () => {});
});

export function emitUserNotification(userId: string, payload: { title: string; body: string; metadata?: unknown }) {
  io.to(`user:${userId}`).emit('notification', payload);
}

server.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Law24 API running on port ${env.PORT}`);
});
