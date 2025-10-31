const express = require('express')
const router = express.Router()
const { protect } = require('../middlewares/auth')
const { addAnimalData, updateAnimalData, upload } = require('../controllers/animalController')


router.post('/addAnimal', protect, addAnimalData)

router.post('/updateAnimalData', protect, upload.single("mediaFile"), updateAnimalData)

module.exports = router