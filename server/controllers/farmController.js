const FarmUser = require('../models/farmUser');
const Farm = require('../models/farm');
const newUser = require('../models/newUsers');
const logger = require('../utils/logger');

const getFarmUsers = async (req, res) => {
  try {
    const { farmId } = req.params;
    
    logger.info(`=== GETTING FARM USERS for farm: ${farmId} ===`);

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

    if (!userId || !role) {
      return res.status(400).json({
        message: "userId and role are required",
      });
    }

    const normalizedRole = role.toLowerCase();
    const allowedRoles = ['staff', 'caretaker', 'veterinarian'];

    if (!allowedRoles.includes(normalizedRole)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // 1️⃣ Ensure farm exists
    const farm = await Farm.findById(farmId);
    if (!farm) {
      return res.status(404).json({ message: "Farm not found" });
    }

    // 2️⃣ Ensure requester is OWNER
    const requesterMembership = await FarmUser.findOne({
      farmId,
      userId: requesterId,
      role: 'owner',
      isActive: true,
    });

    if (!requesterMembership) {
      return res.status(403).json({
        message: "Only farm owners can assign users",
      });
    }

    // 3️⃣ Ensure target user exists
    const targetUser = await newUser.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // 4️⃣ Check for existing assignment (active or inactive)
    const existingAssignment = await FarmUser.findOne({
      farmId,
      userId,
    });

    if (existingAssignment) {
      if (existingAssignment.isActive) {
        return res.status(409).json({
          message: "User is already assigned to this farm",
        });
      } else {
        // Reactivate previously removed user
        existingAssignment.isActive = true;
        existingAssignment.role = normalizedRole;
        existingAssignment.updatedBy = requesterId;
        await existingAssignment.save();

        await existingAssignment.populate('userId', 'full_name email');

        return res.status(200).json({
          message: "User reactivated and assigned to farm successfully",
          data: {
            id: existingAssignment.userId._id,
            name: existingAssignment.userId.full_name,
            email: existingAssignment.userId.email,
            role: existingAssignment.role,
            assignedDate: existingAssignment.updatedAt,
          },
        });
      }
    }

    // 5️⃣ Create mapping
    const farmUser = await FarmUser.create({
      farmId,
      userId,
      role: normalizedRole,
      createdBy: requesterId,
    });

    // 6️⃣ Populate response for frontend
    await farmUser.populate('userId', 'full_name email');

    return res.status(201).json({
      message: "User assigned to farm successfully",
      data: {
        id: farmUser.userId._id,
        name: farmUser.userId.full_name,
        email: farmUser.userId.email,
        role: farmUser.role,
        assignedDate: farmUser.createdAt,
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

const updateFarmUserRole = async (req, res) => {
  try {
    const { farmId, userId } = req.params;
    const { role } = req.body;
    const requesterId = req.user.id;

    // 1️⃣ Validate role
    const allowedRoles = ['staff', 'caretaker'];
    if (!role || !allowedRoles.includes(role.toLowerCase())) {
      return res.status(400).json({
        message: "Invalid role",
      });
    }

    // 2️⃣ Ensure requester is OWNER
    const requesterMembership = await FarmUser.findOne({
      farmId,
      userId: requesterId,
      role: 'owner',
      isActive: true,
    });

    if (!requesterMembership) {
      return res.status(403).json({
        message: "Only farm owners can change roles",
      });
    }

    // Prevent editing owner or vet
    if (targetMembership.role === "owner") {
      return res.status(400).json({
        message: "Owner role cannot be modified",
      });
    }

    if (targetMembership.role === "veterinarian") {
      return res.status(400).json({
        message: "Veterinarian role cannot be modified",
      });
    }

    // 3️⃣ Prevent self-role change
    if (requesterId === userId) {
      return res.status(400).json({
        message: "Owner cannot change their own role",
      });
    }

    // 4️⃣ Find target membership
    const targetMembership = await FarmUser.findOne({
      farmId,
      userId,
      isActive: true,
    });

    if (!targetMembership) {
      return res.status(404).json({
        message: "User is not assigned to this farm",
      });
    }

    // 5️⃣ Prevent modifying another owner
    if (targetMembership.role === 'owner') {
      return res.status(400).json({
        message: "Cannot change role of another owner",
      });
    }

    // 6️⃣ Prevent no-op update
    if (targetMembership.role === role.toLowerCase()) {
      return res.status(409).json({
        message: "User already has this role",
      });
    }

    const oldRole = targetMembership.role;
    targetMembership.role = role.toLowerCase();
    targetMembership.updatedBy = requesterId;
    await targetMembership.save();

    return res.status(200).json({
      message: "User role updated successfully",
      data: {
        userId,
        oldRole,
        newRole: role.toLowerCase(),
      },
    });

  } catch (err) {
    console.error("Error updating farm user role:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getFarmUsers, assignFarmUser, removeFarmUser, updateFarmUserRole };
