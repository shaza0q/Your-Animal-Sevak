const express = require('express')
const router = express.Router()
const { protect } = require('../middlewares/auth')
const { addAnimalData, updateAnimalData, upload, getAnimalHistoryController } = require('../controllers/animalController')

router.post('/addAnimal', protect, addAnimalData)

router.post('/updateAnimalData', protect, upload.single("mediaFile"), updateAnimalData)

// Animal history route
router.get(
  '/:animalId/history',
  protect,
  getAnimalHistoryController
)

module.exports = router