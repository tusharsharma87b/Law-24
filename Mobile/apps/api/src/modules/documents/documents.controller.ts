import { Response } from 'express';
import { DocumentsService } from './documents.service.js';
import type { AuthRequest } from '../../middleware/auth.js';

export class DocumentsController {
  constructor(private readonly service = new DocumentsService()) {}

  getAllDocuments = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      const rows = await this.service.getAllDocuments(req.user.id);
      res.json(
        rows.map((d) => ({
          id: d.id,
          caseId: d.caseId,
          fileName: d.name,
          type: d.type,
          tags: d.tags ?? [],
        })),
      );
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  };

  getDocumentsByCase = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      const { caseId } = req.params;
      const rows = await this.service.getDocumentsByCaseId(caseId, req.user.id);
      res.json(rows);
    } catch (error) {
      const err = error as any;
      if (err?.status === 401) {
        res.status(401).json({ message: err.message ?? 'Unauthorized' });
        return;
      }
      if (err?.status === 404) {
        res.status(404).json({ message: err.message ?? 'Case not found' });
        return;
      }
      res.status(500).json({ message: (error as Error).message });
    }
  };
}
