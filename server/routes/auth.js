const express = require('express')
const router = express.Router()
const {registerUser, authenticateUser, handleLogout} = require('../controllers/authenticate')


router.post('/signup', registerUser)

router.post('/signin', authenticateUser)

router.post('/logout', handleLogout)


module.exports = router;