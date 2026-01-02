const express = require('express')
const router = express.Router()
const { protect } = require('../middlewares/auth')
const { getUserById, searchUsers } = require('../controllers/userController')


router.post('/getUserData', protect, getUserById)

router.get(
  '/search',
  protect,
  searchUsers
);


module.exports = router