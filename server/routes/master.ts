import { Router } from 'express';
import { getDiseaseData, getVaccineData, getBreedData } from '../controllers/masterController';

const router = Router();

router.get('/getDiseaseData', getDiseaseData);
router.get('/getVaccineData', getVaccineData);
router.get('/getBreedData', getBreedData);

export default router;
