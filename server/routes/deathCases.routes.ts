import { Router } from 'express';
import DeathCaseController from '../controllers/deathCase.controller';
import { protect } from '../middlewares/auth';
import roleMiddleware from '../middlewares/role.middleware';
import { uploadSingle, uploadMultiple } from '../middlewares/upload.middleware';
import { UserRole } from '../generated/prisma';
import { validateBody } from '../lib/validate';
import {
  UpdateDeathEventSchema,
  VetRequestSchema,
  VetConfirmationSchema,
  RecordDisposalSchema,
  ManagerReviewSchema,
  UpdateComplianceSchema,
} from '../schemas/deathCase.schemas';

const router = Router();
const controller = new DeathCaseController();

// Apply auth middleware to all routes
router.use(protect);

// Core routes
router.post(
  '/animals/:animalId/death-case',
  roleMiddleware([UserRole.caretaker, UserRole.manager, UserRole.admin]),
  controller.createDeathCase.bind(controller),
);

router.get(
  '/death-cases/:id',
  roleMiddleware([UserRole.caretaker, UserRole.veterinarian, UserRole.manager, UserRole.admin]),
  controller.getDeathCase.bind(controller),
);

// Attachment routes — multipart bodies; Zod body validation is skipped for these
router.post(
  '/death-cases/:id/attachments',
  roleMiddleware([UserRole.caretaker, UserRole.manager, UserRole.admin]),
  uploadMultiple('files'),
  controller.addAttachments.bind(controller),
);

router.post(
  '/death-cases/:id/attachments/single',
  roleMiddleware([UserRole.caretaker, UserRole.manager, UserRole.admin]),
  uploadSingle('file'),
  controller.addAttachment.bind(controller),
);

// Workflow routes
router.patch(
  '/death-cases/:id/event',
  roleMiddleware([UserRole.caretaker, UserRole.manager, UserRole.admin]),
  validateBody(UpdateDeathEventSchema),
  controller.updateEventSection.bind(controller),
);

router.patch(
  '/death-cases/:id/vet-request',
  roleMiddleware([UserRole.caretaker, UserRole.manager, UserRole.admin]),
  validateBody(VetRequestSchema),
  controller.requestVetReview.bind(controller),
);

router.patch(
  '/death-cases/:id/vet-confirmation',
  roleMiddleware([UserRole.veterinarian, UserRole.admin]),
  validateBody(VetConfirmationSchema),
  controller.confirmVet.bind(controller),
);

router.patch(
  '/death-cases/:id/disposal',
  roleMiddleware([UserRole.caretaker, UserRole.manager, UserRole.admin]),
  validateBody(RecordDisposalSchema),
  controller.recordDisposal.bind(controller),
);

router.patch(
  '/death-cases/:id/review',
  roleMiddleware([UserRole.manager, UserRole.admin]),
  validateBody(ManagerReviewSchema),
  controller.managerReview.bind(controller),
);

router.patch(
  '/death-cases/:id/compliance',
  roleMiddleware([UserRole.caretaker, UserRole.manager, UserRole.admin]),
  validateBody(UpdateComplianceSchema),
  controller.updateComplianceChecklist.bind(controller),
);

// List routes
router.get(
  '/death-cases',
  roleMiddleware([UserRole.caretaker, UserRole.veterinarian, UserRole.manager, UserRole.admin]),
  controller.getDeathCases.bind(controller),
);

// Stats route
router.get(
  '/workflow-stats',
  roleMiddleware([UserRole.manager, UserRole.admin]),
  controller.getWorkflowStats.bind(controller),
);

export default router;
