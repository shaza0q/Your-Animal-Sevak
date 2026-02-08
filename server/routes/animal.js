const express = require('express')
const router = express.Router()
const { protect } = require('../middlewares/auth')
const { addAnimalData, updateAnimalData, upload, getAnimalHistoryController, searchAnimalController, listAnimalsByType, getAnimalAbstract } = require('../controllers/animalController')

// Search animals route
router.get('/search', protect, searchAnimalController)

// Get animal abstract data
router.get('/abstract/:animalId', protect, getAnimalAbstract)

// Get animals by farm and type
router.get('/farms/:farmId', protect, listAnimalsByType)

router.post('/addAnimal', protect, addAnimalData)

router.post('/updateAnimalData', protect, upload.single("mediaFile"), updateAnimalData)

// Animal history route
router.get(
  '/:animalId/history',
  protect,
  getAnimalHistoryController
)

module.exports = router