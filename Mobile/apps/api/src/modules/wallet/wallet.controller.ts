import { Response } from 'express';
import { WalletService } from './wallet.service.js';
import type { AuthRequest } from '../../middleware/auth.js';

export class WalletController {
  constructor(private readonly service = new WalletService()) {}

  getWallet = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      if (!req.user || req.user.id !== userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      const wallet = await this.service.getWalletByUserId(userId);
      if (!wallet) {
        res.status(404).json({ message: 'Wallet not found' });
        return;
      }
      res.json(wallet);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  };
}
