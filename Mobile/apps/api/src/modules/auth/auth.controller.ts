import { Router, type Request, type Response } from 'express';
import rateLimit from 'express-rate-limit';
import { verifyAccessToken } from '../../lib/auth.js';
import { AuthService } from './auth.service.js';

export const authRouter = Router();
const service = new AuthService();

const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
});

const handleSendOtp = async (req: Request, res: Response) => {
  try {
    const result = await service.sendOtp(req.body);
    return res.json(result);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

const handleVerifyOtp = async (req: Request, res: Response) => {
  try {
    const result = await service.verifyOtp(req.body, {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

authRouter.post('/otp/send', otpLimiter, handleSendOtp);
authRouter.post('/send-otp', otpLimiter, handleSendOtp);
authRouter.post('/otp/verify', handleVerifyOtp);
authRouter.post('/verify-otp', handleVerifyOtp);
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const result = await service.login(req.body, {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

authRouter.get('/me', async (req: Request, res: Response) => {
  try {
    const authorization = req.headers.authorization;
    if (!authorization || !authorization.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const token = authorization.slice(7);
    const payload = verifyAccessToken(token);
    const me = await service.getMe(payload.sub);
    res.json(me);
  } catch (error) {
    res.status(401).json({ message: (error as Error).message });
  }
});
