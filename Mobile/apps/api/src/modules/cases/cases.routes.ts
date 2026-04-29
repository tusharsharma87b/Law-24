import { Router } from 'express';
import { CasesController } from './cases.controller.js';
import { requireAuth } from '../../middleware/auth.js';

const controller = new CasesController();
export const casesRouter = Router();

casesRouter.get('/cases/:userId', requireAuth, controller.getCasesByUser);
