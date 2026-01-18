const express = require("express");
const router = express.Router();
const { searchUsers } = require("../controllers/farmUser.controller");
const { protect } = require("../middlewares/auth");
const { requireFarmAccess } = require("../middlewares/farmAuth");

router.get(
  "/:farmId/users/search",
  protect,
  requireFarmAccess,
  searchUsers
);

module.exports = router;
