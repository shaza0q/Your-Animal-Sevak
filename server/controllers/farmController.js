const FarmUser = require('../models/farmUser');

const getFarmUsers = async (req, res) => {
  try {
    const { farmId } = req.params;

    const farmUsers = await FarmUser.find({
      farmId,
      isActive: true,
    })
      .populate('userId', 'full_name email')
      .lean();

    const response = farmUsers.map((fu) => ({
      id: fu.userId._id,
      name: fu.userId.full_name,
      email: fu.userId.email,
      role: fu.role,
      assignedDate: fu.assignedAt,
    }));

    return res.status(200).json({
      message: "Farm users retrieved successfully",
      data: response,
    });
  } catch (err) {
    console.error("Error retrieving farm users:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

const assignFarmUser = async (req, res) => {
  try {
    const { farmId } = req.params;
    const { userId, role } = req.body;
    const requesterId = req.user.id;

    // 1️⃣ Validate input
    if (!userId || !role) {
      return res.status(400).json({
        message: "userId and role are required",
      });
    }

    if (!['staff', 'caretaker', 'veterinarian'].includes(role)) {
      return res.status(400).json({
        message: "Invalid role",
      });
    }

    // 2️⃣ Ensure farm exists
    const farm = await Farm.findById(farmId);
    if (!farm) {
      return res.status(404).json({ message: "Farm not found" });
    }

    // 3️⃣ Ensure requester is OWNER of farm
    const requesterMembership = await FarmUser.findOne({
      farmId,
      userId: requesterId,
      role: { $in: ['owner', 'admin'] }, // will change it later for owner only
      isActive: true,
    });

    if (!requesterMembership) {
      return res.status(403).json({
        message: "Only farm owners can assign users",
      });
    }

    // 4️⃣ Ensure target user exists
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // 5️⃣ Prevent duplicate assignment
    const existingAssignment = await FarmUser.findOne({
      farmId,
      userId,
      isActive: true,
    });

    if (existingAssignment) {
      return res.status(409).json({
        message: "User is already assigned to this farm",
      });
    }

    // 6️⃣ Create farm-user mapping
    const farmUser = await FarmUser.create({
      farmId,
      userId,
      role,
      createdBy: requesterId,
    });

    return res.status(201).json({
      message: "User assigned to farm successfully",
      data: {
        id: farmUser.userId,
        role: farmUser.role,
        assignedDate: farmUser.assignedAt,
      },
    });

  } catch (err) {
    console.error("Error assigning farm user:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

const removeFarmUser = async (req, res) => {
  try {
    const { farmId, userId } = req.params;
    const requesterId = req.user.id;

    // 1️⃣ Ensure requester is OWNER
    const requesterMembership = await FarmUser.findOne({
      farmId,
      userId: requesterId,
      role: 'owner',
      isActive: true,
    });

    if (!requesterMembership) {
      return res.status(403).json({
        message: "Only farm owners can remove users",
      });
    }

    // 2️⃣ Prevent owner from removing themselves
    if (requesterId === userId) {
      return res.status(400).json({
        message: "Owner cannot remove themselves from the farm",
      });
    }

    // 3️⃣ Find target membership
    const targetMembership = await FarmUser.findOne({
      farmId,
      userId,
      isActive: true,
      role: { $nin: ['owner', 'admin'] }
    });

    if (!targetMembership) {
      return res.status(404).json({
        message: "User is not assigned to this farm",
      });
    }

    // 4️⃣ Prevent removing another owner
    if (targetMembership.role === 'owner') {
      return res.status(400).json({
        message: "Cannot remove another owner from the farm",
      });
    }

    // 5️⃣ Soft delete
    targetMembership.isActive = false;
    await targetMembership.save();

    return res.status(200).json({
      message: "User removed from farm successfully",
    });

  } catch (err) {
    console.error("Error removing farm user:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getFarmUsers, assignFarmUser, removeFarmUser };
