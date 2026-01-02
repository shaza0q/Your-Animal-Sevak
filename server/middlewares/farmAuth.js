const requireFarmAccess = async (req, res, next) => {
  const { farmId } = req.params;
  const userId = req.user.id;

  const membership = await FarmUser.findOne({
    farmId,
    userId,
    isActive: true,
  });

  if (!membership) {
    return res.status(403).json({
      message: "You do not have access to this farm",
    });
  }

  req.farmRole = membership.role; // optional, useful later
  next();
};

module.exports = { requireFarmAccess };