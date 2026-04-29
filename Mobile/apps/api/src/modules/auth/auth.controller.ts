import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { AuthService } from './auth.service.js';
import { requireAuth, type AuthRequest } from '../../middleware/auth.js';

export const authRouter = Router();
const service = new AuthService();

const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
});

authRouter.post('/otp/send', otpLimiter, async (req, res) => {
  try {
    const result = await service.sendOtp(req.body);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

authRouter.post('/otp/verify', async (req, res) => {
  try {
    const result = await service.verifyOtp(req.body, {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

authRouter.get('/me', requireAuth, async (req: AuthRequest, res) => {
  try {
    const me = await service.getMe(req.user!.id);
    res.json(me);
  } catch (error) {
    res.status(404).json({ message: (error as Error).message });
  }
});
