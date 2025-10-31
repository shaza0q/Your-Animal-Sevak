const express = require('express')
const router = express.Router()
const { getDiseaseData, getVaccineData, getBreedData } = require('../controllers/masterController')


router.get('/getDiseaseData', getDiseaseData)
router.get('/getVaccineData', getVaccineData)
router.get('/getBreedData', getBreedData)


module.exports = router