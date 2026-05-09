import { Router } from 'express';
import { DocumentsController } from './documents.controller.js';
import { requireAuth } from '../../middleware/auth.js';

const controller = new DocumentsController();
export const documentsRouter = Router();

documentsRouter.get('/documents', requireAuth, controller.getAllDocuments);
documentsRouter.get('/documents/:caseId', requireAuth, controller.getDocumentsByCase);
