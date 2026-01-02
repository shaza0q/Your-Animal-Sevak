const express = require('express')
const router = express.Router()
const { protect } = require('../middlewares/auth')
const { getUserById } = require('../controllers/userController')


router.post('/getUserData', protect, getUserById)

r


module.exports = router