const farmUser = require("../models/farmUser");
const Animal = require("../models/animal");
const logger = require("../utils/logger");

const requireAnimalFarmAccess = async (req, res, next) => {
  const { animalId } = req.params;
  const userId = req.user.id;

  try {
    // First, get the animal to find its farm
    const animal = await Animal.findById(animalId);
    
    if (!animal) {
      return res.status(404).json({
        message: "Animal not found",
      });
    }

    const farmId = animal.farmId;
    logger.info(`Checking access for user ${userId} to farm ${farmId} via animal ${animalId}`);
    
    
    // Check if user has access to the animal's farm
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

    req.farmRole = membership.role;
    req.farmId = farmId; // Add farmId to request for potential use
    next();
  } catch (error) {
    logger.error(`Error checking animal farm access: ${error.message}`);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

module.exports = { requireAnimalFarmAccess };
