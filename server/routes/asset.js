const express = require('express')
const router = express.Router()
const { protect } = require('../middlewares/auth')
const { addFarmData } = require('../controllers/assetController')


router.post('/addFarm', protect, addFarmData)



module.exports = router