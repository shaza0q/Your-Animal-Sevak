const farmUser = require("../models/farmUser");
const logger = require("../utils/logger");

const requireFarmAccess = async (req, res, next) => {
  const { farmId } = req.params;
  const userId = req.user.id;

  logger.info(`Checking access for user ${userId} to farm ${farmId}`);
  const membership = await farmUser.findOne({
    farmId,
    userId,
    isActive: true,
  });

  if (!membership) {
    return res.status(403).json({
      message: "You do not have access to this farm",
    });
  }

  logger.info(`User ${userId} has access to farm ${farmId}`);

  req.farmRole = membership.role; // optional, useful later
  next();
};

module.exports = { requireFarmAccess };