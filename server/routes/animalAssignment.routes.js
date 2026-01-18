const express = require("express");
const router = express.Router();
const { protect } = require('../middlewares/auth')
const { getAssignments, assignUser, unassignUser } = require('../controllers/animalAssignment.controller');
const { requireAnimalFarmAccess } = require("../middlewares/animalFarmAuth");

// View active assignments
router.get(
  "/:animalId/assignments",
  protect,
  requireAnimalFarmAccess,
  getAssignments
);

// Assign caretaker / vet
router.post(
  "/:animalId/assignments",
  protect,
  requireAnimalFarmAccess,
  assignUser
);

// Unassign
router.post(
  "/:animalId/assignments/:assignedUserId/unassign",
  protect,
  requireAnimalFarmAccess,
  unassignUser
);

module.exports = router;
