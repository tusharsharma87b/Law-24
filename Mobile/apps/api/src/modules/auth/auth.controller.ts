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
    console.log('[AuthController] sendOtp called with body:', JSON.stringify(req.body));
    const result = await service.sendOtp(req.body);
    console.log('[AuthController] sendOtp result:', JSON.stringify(result));
    
    if (!result) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to generate OTP' 
      });
    }
    
    return res.status(200).json(result);
  } catch (error) {
    console.error('[AuthController] sendOtp error:', error);
    const message = (error as Error).message || 'OTP generation failed';
    return res.status(400).json({ 
      success: false, 
      message 
    });
  }
};

const handleVerifyOtp = async (req: Request, res: Response) => {
  try {
    console.log('[AuthController] verifyOtp called with body:', JSON.stringify(req.body));
    const result = await service.verifyOtp(req.body, {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    console.log('[AuthController] verifyOtp result:', JSON.stringify(result).substring(0, 300));
    
    if (!result) {
      return res.status(500).json({ 
        success: false, 
        message: 'Verification failed' 
      });
    }
    
    return res.status(200).json(result);
  } catch (error) {
    console.error('[AuthController] verifyOtp error:', error);
    const message = (error as Error).message || 'OTP verification failed';
    return res.status(400).json({ 
      success: false, 
      message 
    });
  }
};

authRouter.post('/otp/send', otpLimiter, handleSendOtp);
authRouter.post('/send-otp', otpLimiter, handleSendOtp);
authRouter.post('/otp/verify', handleVerifyOtp);
authRouter.post('/verify-otp', handleVerifyOtp);
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    console.log('[AuthController] login called with body:', JSON.stringify(req.body).substring(0, 100));
    const result = await service.login(req.body, {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    
    if (!result) {
      return res.status(500).json({ 
        success: false, 
        message: 'Login failed' 
      });
    }
    
    return res.status(200).json(result);
  } catch (error) {
    console.error('[AuthController] login error:', error);
    const message = (error as Error).message || 'Login failed';
    return res.status(400).json({ 
      success: false, 
      message 
    });
  }
});

authRouter.get('/me', async (req: Request, res: Response) => {
  try {
    const authorization = req.headers.authorization;
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }
    const token = authorization.slice(7);
    const payload = verifyAccessToken(token);
    const me = await service.getMe(payload.sub);
    
    if (!me) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    return res.status(200).json(me);
  } catch (error) {
    console.error('[AuthController] /me error:', error);
    const message = (error as Error).message || 'Failed to fetch user';
    return res.status(401).json({ 
      success: false, 
      message 
    });
  }
});
