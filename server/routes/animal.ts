import { Router } from 'express';
import { protect } from '../middlewares/auth';
import { requireAnimalFarmAccess } from '../middlewares/animalFarmAuth';
import {
  addAnimalData,
  updateAnimalData,
  upload,
  getAnimalHistoryController,
  searchAnimalController,
  listAnimalsByType,
  getAnimalAbstract,
  sellAnimalController,
  uploadAnimalPhotoController,
} from '../controllers/animalController';
import { validateBody } from '../lib/validate';
import { AddAnimalSchema, RecordAnimalEventSchema, SellAnimalSchema } from '../schemas/animal.schemas';

const router = Router();

// Search animals route
router.get('/search', protect, searchAnimalController);

// Get animal abstract data
router.get('/abstract/:animalId', protect, getAnimalAbstract);

// Get animals by farm and type
router.get('/farms/:farmId', protect, listAnimalsByType);

router.post('/addAnimal', protect, validateBody(AddAnimalSchema), addAnimalData);

// Multer parses the multipart body first; Zod then validates the text fields.
router.post(
  '/updateAnimalData',
  protect,
  upload.single('mediaFile'),
  validateBody(RecordAnimalEventSchema),
  updateAnimalData,
);

// Upload / change an animal's profile photo
router.post(
  '/:animalId/photo',
  protect,
  requireAnimalFarmAccess,
  upload.single('photo'),
  uploadAnimalPhotoController,
);

// Sell an animal — atomic: Sale record + AnimalUpdate event + status change
router.post(
  '/:animalId/sell',
  protect,
  requireAnimalFarmAccess,
  validateBody(SellAnimalSchema),
  sellAnimalController,
);

// Animal history route
router.get('/:animalId/history', protect, getAnimalHistoryController);

export default router;
