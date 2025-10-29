const express = require('express')
const router = express.Router()
const { protect } = require('../middlewares/auth')
const { addAnimalData } = require('../controllers/animalController')


router.post('/addAnimal', protect, addAnimalData)



module.exports = router