import { Router } from 'express';
import { WalletController } from './wallet.controller.js';
import { requireAuth } from '../../middleware/auth.js';

const controller = new WalletController();
export const walletRouter = Router();

walletRouter.get('/wallet/:userId', requireAuth, controller.getWallet);
