import { Response } from 'express';
import { z } from 'zod';
import { UsersService } from './users.service.js';
import type { AuthRequest } from '../../middleware/auth.js';

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(8).optional(),
});

export class UsersController {
  constructor(private readonly service = new UsersService()) {}

  getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      const user = await this.service.getUserById(req.user.id);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  };

  createUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      const body = createUserSchema.parse(req.body);
      const user = await this.service.createUser(body);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  };
}
