const express = require('express')
const router = express.Router()
const {getHealthData} = require('../controllers/statController')
const { protect } = require('../middlewares/auth')

router.post('/getHealthData', protect, getHealthData)


module.exports = router