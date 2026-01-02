const express = require('express')
const router = express.Router()
const { protect } = require('../middlewares/auth')
const { getFarmUsers, assignFarmUser, removeFarmUser, updateFarmUserRole } = require('../controllers/farmController')
const { requireFarmAccess } = require('../middlewares/farmAuth')


router.get(
  '/:farmId/users',
  protect,
  requireFarmAccess, // 👈 authorization middleware
  getFarmUsers
);

router.post(
  '/:farmId/users',
  protect,
  requireFarmAccess, // user must belong to farm
  assignFarmUser     // owner check is inside controller
);

router.delete(
  '/:farmId/users/:userId',
  protect,
  requireFarmAccess, // requester must belong to farm
  removeFarmUser     // owner-only logic inside controller
);

router.patch(
  '/:farmId/users/:userId/role',
  protect,
  requireFarmAccess, // ensures requester belongs to farm
  updateFarmUserRole
);

module.exports = router
