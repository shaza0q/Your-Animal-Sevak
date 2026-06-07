import { Request, Response } from 'express';
import DeathCaseService from '../services/deathCase.service';
import prisma from '../lib/prisma';
import { parsePage } from '../lib/pagination';
import {
  DeathCaseNotFoundException,
  InvalidWorkflowTransitionException,
  UnauthorizedWorkflowActionException,
  ImmutableRecordException,
  InvalidSectionException,
} from '../common/exceptions/deathCase.exceptions';

interface UserContext {
  userId: string;
  role: string;
  username?: string;
}

class DeathCaseController {
  private service = new DeathCaseService();

  private _extractUserContext(req: Request): UserContext {
    if (!req.user) throw new Error('Not authenticated');
    return {
      userId: req.user.id,
      role: req.user.role,
    };
  }

  private _handleError(error: unknown, res: Response): void {
    if (error instanceof DeathCaseNotFoundException) {
      res.status(404).json({
        success: false,
        message: (error as Error).message,
        error: 'NOT_FOUND',
      });
      return;
    }
    if (
      error instanceof InvalidWorkflowTransitionException ||
      error instanceof ImmutableRecordException ||
      error instanceof InvalidSectionException
    ) {
      res.status(400).json({
        success: false,
        message: (error as Error).message,
        error: 'BAD_REQUEST',
      });
      return;
    }
    if (error instanceof UnauthorizedWorkflowActionException) {
      res.status(403).json({
        success: false,
        message: (error as Error).message,
        error: 'FORBIDDEN',
      });
      return;
    }
    console.error('Controller error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'INTERNAL_ERROR',
    });
  }

  async createDeathCase(req: Request, res: Response): Promise<void> {
    try {
      const { animalId } = req.params;
      const userContext = this._extractUserContext(req);

      if (!animalId) {
        res.status(400).json({
          success: false,
          message: 'animalId is required',
          error: 'INVALID_INPUT',
        });
        return;
      }

      const deathCase = await this.service.createDeathCase(animalId, userContext);

      res.status(201).json({
        success: true,
        data: deathCase,
        message: 'Death case created successfully',
      });
    } catch (error) {
      this._handleError(error, res);
    }
  }

  async getDeathCase(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userContext = this._extractUserContext(req);

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Case ID is required',
          error: 'INVALID_INPUT',
        });
        return;
      }

      const deathCase = await this.service.getDeathCase(id, userContext);

      res.json({ success: true, data: deathCase });
    } catch (error) {
      this._handleError(error, res);
    }
  }

  async updateEventSection(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userContext = this._extractUserContext(req);
      const payload = req.body as Record<string, unknown>;

      const deathCase = await this.service.updateEventSection(id, payload, userContext);

      res.json({
        success: true,
        data: deathCase,
        message: 'Event section updated successfully',
      });
    } catch (error) {
      this._handleError(error, res);
    }
  }

  async requestVetReview(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userContext = this._extractUserContext(req);
      const { requiresVet } = req.body as { requiresVet: boolean };

      const deathCase = await this.service.requestVetReview(id, requiresVet, userContext);

      res.json({
        success: true,
        data: deathCase,
        message: requiresVet ? 'Veterinary review requested' : 'Proceeding without veterinary review',
      });
    } catch (error) {
      this._handleError(error, res);
    }
  }

  async confirmVet(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userContext = this._extractUserContext(req);
      const payload = req.body as Record<string, unknown>;

      const deathCase = await this.service.confirmVet(id, payload, userContext);

      res.json({
        success: true,
        data: deathCase,
        message: 'Veterinary confirmation completed',
      });
    } catch (error) {
      this._handleError(error, res);
    }
  }

  async recordDisposal(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userContext = this._extractUserContext(req);
      const payload = req.body as Record<string, unknown>;

      const deathCase = await this.service.recordDisposal(id, payload, userContext);

      res.json({
        success: true,
        data: deathCase,
        message: 'Disposal recorded successfully',
      });
    } catch (error) {
      this._handleError(error, res);
    }
  }

  async managerReview(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userContext = this._extractUserContext(req);
      const {
        decision,
        comments,
        correctionRequests,
      } = req.body as {
        decision: string;
        comments?: string;
        correctionRequests?: Array<{ field: string; expectedValue: unknown; reason: string }>;
      };

      const deathCase = await this.service.managerReview(
        id,
        decision,
        comments,
        correctionRequests,
        userContext,
      );

      res.json({
        success: true,
        data: deathCase,
        message: decision === 'approved' ? 'Death case approved' : 'Correction requested',
      });
    } catch (error) {
      this._handleError(error, res);
    }
  }

  async getDeathCases(req: Request, res: Response): Promise<void> {
    try {
      const userContext = this._extractUserContext(req);
      const { farmId } = req.query as { farmId?: string };

      if (!farmId) {
        res.status(400).json({
          success: false,
          message: 'farmId query parameter is required',
          error: 'INVALID_INPUT',
        });
        return;
      }

      const { page, limit } = parsePage(req.query as Record<string, string>, 20);
      const filters = {
        farmId,
        workflowStatus: req.query.status as string | undefined,
        startDate: req.query.startDate as string | undefined,
        endDate: req.query.endDate as string | undefined,
        causeOfDeath: req.query.cause as string | undefined,
        type: req.query.type as string | undefined,
        page,
        limit,
      };

      const result = await this.service.findDeathCases(filters, userContext);

      res.json({ success: true, ...result });
    } catch (error) {
      this._handleError(error, res);
    }
  }

  async addAttachment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userContext = this._extractUserContext(req);

      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'No file uploaded',
          error: 'INVALID_INPUT',
        });
        return;
      }

      const deathCase = await this.service.addAttachment(id, req.file, userContext);

      res.json({
        success: true,
        data: deathCase,
        message: 'Attachment added successfully',
      });
    } catch (error) {
      this._handleError(error, res);
    }
  }

  async addAttachments(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userContext = this._extractUserContext(req);

      if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
        res.status(400).json({
          success: false,
          message: 'No files uploaded',
          error: 'INVALID_INPUT',
        });
        return;
      }

      const deathCase = await this.service.addAttachments(
        id,
        req.files as Express.Multer.File[],
        userContext,
      );

      res.json({
        success: true,
        data: deathCase,
        message: `${(req.files as Express.Multer.File[]).length} attachment(s) added successfully`,
      });
    } catch (error) {
      this._handleError(error, res);
    }
  }

  async updateComplianceChecklist(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userContext = this._extractUserContext(req);
      const checklistItem = req.body as {
        label: string;
        required?: boolean;
        completed?: boolean;
        notes?: string;
      };

      const deathCase = await this.service.updateComplianceChecklist(
        id,
        checklistItem,
        userContext,
      );

      res.json({
        success: true,
        data: deathCase,
        message: 'Compliance checklist updated',
      });
    } catch (error) {
      this._handleError(error, res);
    }
  }

  async getWorkflowStats(req: Request, res: Response): Promise<void> {
    try {
      const { farmId } = req.query as { farmId?: string };

      if (!farmId) {
        res.status(400).json({ success: false, message: 'farmId is required' });
        return;
      }

      const start = req.query.startDate
        ? new Date(req.query.startDate as string)
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = req.query.endDate ? new Date(req.query.endDate as string) : new Date();

      const totalDeaths = await prisma.deceasedAnimalRecord.count({
        where: {
          farmId,
          deathEvent: { dateOfDeath: { gte: start, lte: end } },
        },
      });

      res.json({ success: true, data: { totalDeaths } });
    } catch (error) {
      this._handleError(error, res);
    }
  }
}

export default DeathCaseController;
