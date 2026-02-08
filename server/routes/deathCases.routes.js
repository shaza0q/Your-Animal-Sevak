const express = require('express');
const router = express.Router();
const DeathCaseController = require('../controllers/deathCase.controller');
const { protect } = require('../middlewares/auth');
const roleMiddleware = require('../middlewares/role.middleware');
const { uploadSingle, uploadMultiple } = require('../middlewares/upload.middleware'); // Updated import

const controller = new DeathCaseController();

// Apply auth middleware to all routes
router.use(protect);

// Core routes
router.post(
  '/animals/:animalId/death-case',
  roleMiddleware(['caretaker', 'manager', 'admin']),
  controller.createDeathCase.bind(controller)
);

router.get(
  '/death-cases/:id',
  roleMiddleware(['caretaker', 'veterinarian', 'manager', 'admin']),
  controller.getDeathCase.bind(controller)
);

// Attachment routes
router.post(
  '/death-cases/:id/attachments',
  roleMiddleware(['caretaker', 'manager', 'admin']),
  uploadMultiple('files'), // Accept multiple files
  controller.addAttachments.bind(controller)
);

router.post(
  '/death-cases/:id/attachments/single',
  roleMiddleware(['caretaker', 'manager', 'admin']),
  uploadSingle('file'), // Accept single file
  controller.addAttachment.bind(controller)
);

// Workflow routes
router.patch(
  '/death-cases/:id/event',
  roleMiddleware(['caretaker', 'manager', 'admin']),
  controller.updateEventSection.bind(controller)
);

router.patch(
  '/death-cases/:id/vet-request',
  roleMiddleware(['caretaker', 'manager', 'admin']),
  controller.requestVetReview.bind(controller)
);

router.patch(
  '/death-cases/:id/vet-confirmation',
  roleMiddleware(['veterinarian', 'admin']),
  controller.confirmVet.bind(controller)
);

router.patch(
  '/death-cases/:id/disposal',
  roleMiddleware(['caretaker', 'manager', 'admin']),
  controller.recordDisposal.bind(controller)
);

router.patch(
  '/death-cases/:id/review',
  roleMiddleware(['manager', 'admin']),
  controller.managerReview.bind(controller)
);

// List routes
router.get(
  '/death-cases',
  roleMiddleware(['caretaker', 'veterinarian', 'manager', 'admin']),
  controller.getDeathCases.bind(controller)
);

module.exports = router;