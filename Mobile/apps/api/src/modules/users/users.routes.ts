import { Router } from 'express';
import { UsersController } from './users.controller.js';
import { requireAuth } from '../../middleware/auth.js';

const controller = new UsersController();
export const usersRouter = Router();

usersRouter.get('/users', requireAuth, controller.getUsers);
usersRouter.post('/users', requireAuth, controller.createUser);
