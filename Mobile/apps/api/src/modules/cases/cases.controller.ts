import { Response } from 'express';
import { CasesService } from './cases.service.js';
import type { AuthRequest } from '../../middleware/auth.js';

export class CasesController {
  constructor(private readonly service = new CasesService()) {}

  getCasesByUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      if (!req.user || req.user.id !== userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      const rows = await this.service.getCasesByUserId(userId);
      res.json(rows);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  };
}
