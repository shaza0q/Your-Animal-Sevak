const express = require('express')
const router = express.Router()
const { protect } = require('../middlewares/auth')
const { getFarmUsers, assignFarmUser, removeFarmUser, getFarmData, getAllFarmData } = require('../controllers/farmController')
const { getAnimalOverview, listAnimalsByType, getAnimalDetailController } = require('../controllers/animalController')
const { requireFarmAccess } = require('../middlewares/farmAuth')
const { searchUsers } = require('../controllers/farmUser.controller')

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

router.get(
  '/getAllFarms', 
  protect, 
  getAllFarmData
)

router.get(
  '/:farmId',
  protect,
  requireFarmAccess,
  getFarmData
)

router.get(
  '/:farmId/animals/overview',
  protect,
  requireFarmAccess,
  getAnimalOverview
)

router.get(
  '/:farmId/animals',
  protect,
  requireFarmAccess,
  listAnimalsByType
)

router.get(
  '/:farmId/animals/:animalId',
  protect,
  requireFarmAccess,
  getAnimalDetailController
)

router.get(
  '/:farmId/users/search',
  protect,
  requireFarmAccess,
  searchUsers
)

module.exports = router
