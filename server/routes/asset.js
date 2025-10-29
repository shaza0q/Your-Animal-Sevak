const express = require('express')
const router = express.Router()
const { protect } = require('../middlewares/auth')
const { addFarmData, getFarmData } = require('../controllers/assetController')


router.post('/addFarm', protect, addFarmData)

router.get('/getFarm', protect, getFarmData)


module.exports = router