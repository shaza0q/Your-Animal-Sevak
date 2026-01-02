const express = require('express')
const router = express.Router()
const { protect } = require('../middlewares/auth')
const { getFarmUsers, assignFarmUser, removeFarmUser } = require('../controllers/farmController')
const { requireFarmAccess } = require('../middlewares/farmAuth')


router.get(
  '/farms/:farmId/users',
  protect,
  requireFarmAccess, // 👈 authorization middleware
  getFarmUsers
);

router.post(
  '/farms/:farmId/users',
  protect,
  requireFarmAccess, // user must belong to farm
  assignFarmUser     // owner check is inside controller
);

router.delete(
  '/farms/:farmId/users/:userId',
  protect,
  requireFarmAccess, // requester must belong to farm
  removeFarmUser     // owner-only logic inside controller
);

module.exports = router
