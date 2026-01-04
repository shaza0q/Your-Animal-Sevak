const express = require('express')
const router = express.Router()
const { protect } = require('../middlewares/auth')
const { addFarmData, getWorkerData } = require('../controllers/assetController')


router.post('/addFarm', protect, addFarmData)

router.get('/getWorker', protect, getWorkerData)



module.exports = router