/**
 * @typedef {import('../types/schemas/farm.schema').Farm} Farm
 * @typedef {import('../types/dtos/farmUser.dto').FarmUserDTO} FarmUserDTO
 * @typedef {import('../types/dtos/farm.dto').FarmDTO} FarmDTO
 * @typedef {import('../types/dtos/apiResponse.dto').ApiResponse<FarmUserDTO[]>} FarmUserListResponse
 * @typedef {import('../types/dtos/apiResponse.dto').ApiResponse<FarmUserDTO>} AssignFarmUserResponse
 * @typedef {import('../types/schemas/populatedUser.schema').PopulatedUser} PopulatedUser
 * @typedef {import('../types/dtos/farmSummary.dto').FarmSummaryDTO} FarmSummaryDTO
 */

const FarmUser = require('../models/farmUser');
const Farm = require('../models/farm');
const User = require('../models/user');
const logger = require('../utils/logger');

const getFarmUsers = async (req, res) => {
  try {
    const { farmId } = req.params;
    
    const farmUsers = await FarmUser.find({
      farmId,
      isActive: true,
    })
      .populate('userId', 'full_name email')
      .lean();

    /** @type {FarmUserDTO[]} */
    const data = farmUsers.map((fu) => {
      const user = fu.userId;

      // Runtime guard (THIS is the key)
      if (!user || typeof user !== "object" || !("full_name" in user) || !("email" in user)) {
        throw new Error("Expected userId to be populated with full_name and email");
      }

      /** @type {PopulatedUser} */
      const populatedUser = {
        _id: user._id,
        full_name: String(user.full_name),
        email: String(user.email)
      };

      return {
        id: populatedUser._id?.toString(),
        name: populatedUser.full_name,
        email: populatedUser.email,
        role: fu.role,
        assignedDate: fu.assignedAt,
      };
    });

    /** @type {FarmUserListResponse} */
    const responseBody = {
      message: "Farm users retrieved successfully",
      data,
    };

    return res.status(200).json(responseBody);

  } catch (err) {
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
      return res.status(400).json({ message: "userId and role are required" });
    }

    const normalizedRole = role.toLowerCase();
    const allowedRoles = ["admin", "staff", "caretaker", "veterinarian", "owner"];

    if (!allowedRoles.includes(normalizedRole)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // 2️⃣ Ensure farm exists
    const farm = await Farm.findById(farmId);
    if (!farm) {
      return res.status(404).json({ message: "Farm not found" });
    }

    // 3️⃣ Ensure requester is OWNER
    const requesterMembership = await FarmUser.findOne({
      farmId,
      userId: requesterId,
      role: "owner",
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
      return res.status(404).json({ message: "User not found" });
    }

    // Use user's original role from their profile, not from farm assignment
    const userOriginalRole = targetUser.role;

    // 5️⃣ Check existing assignment
    const existingAssignment = await FarmUser.findOne({ farmId, userId });

    if (existingAssignment) {
      if (existingAssignment.isActive) {
        return res.status(409).json({
          message: "User is already assigned to this farm",
        });
      }

      // 🔁 Reactivate
      existingAssignment.isActive = true;
      existingAssignment.role = userOriginalRole; // Use user's original role
      await existingAssignment.save();

      await existingAssignment.populate("userId", "full_name email");

      /** @type {PopulatedUser} */
      const populatedUser = /** @type {PopulatedUser} */ (/** @type {unknown} */ (existingAssignment.userId));

      /** @type {FarmUserDTO} */
      const data = {
        id: populatedUser._id?.toString() || populatedUser.toString(),
        name: populatedUser.full_name,
        email: populatedUser.email,
        role: existingAssignment.role,
        assignedDate: existingAssignment.updatedAt,
      };

      /** @type {AssignFarmUserResponse} */
      const responseBody = {
        message: "User reactivated and assigned to farm successfully",
        data,
      };

      return res.status(200).json(responseBody);
    }

    // 6️⃣ Create new mapping
    const farmUser = await FarmUser.create({
      farmId,
      userId,
      role: userOriginalRole, // Use user's original role from profile
      createdBy: requesterId,
    });

    await farmUser.populate("userId", "full_name email");

    /** @type {PopulatedUser} */
    const populatedUser = /** @type {PopulatedUser} */ (/** @type {unknown} */ (farmUser.userId));

    /** @type {FarmUserDTO} */
    const data = {
      id: populatedUser._id?.toString() || populatedUser.toString(),
      name: populatedUser.full_name,
      email: populatedUser.email,
      role: farmUser.role,
      assignedDate: farmUser.createdAt,
    };

    /** @type {AssignFarmUserResponse} */
    const responseBody = {
      message: "User assigned to farm successfully",
      data,
    };

    return res.status(201).json(responseBody);

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

// const updateFarmUserRole = async (req, res) => {
//   try {
//     const { farmId, userId } = req.params;
//     const { role } = req.body;
//     const requesterId = req.user.id;

//     // 1️⃣ Validate role
//     const allowedRoles = ['staff', 'caretaker'];
//     if (!role || !allowedRoles.includes(role.toLowerCase())) {
//       return res.status(400).json({
//         message: "Invalid role",
//       });
//     }

//     // 2️⃣ Ensure requester is OWNER
//     const requesterMembership = await FarmUser.findOne({
//       farmId,
//       userId: requesterId,
//       role: 'owner',
//       isActive: true,
//     });

//     if (!requesterMembership) {
//       return res.status(403).json({
//         message: "Only farm owners can change roles",
//       });
//     }

//     // Prevent editing owner or vet
//     if (targetMembership.role === "owner") {
//       return res.status(400).json({
//         message: "Owner role cannot be modified",
//       });
//     }

//     if (targetMembership.role === "veterinarian") {
//       return res.status(400).json({
//         message: "Veterinarian role cannot be modified",
//       });
//     }

//     // 3️⃣ Prevent self-role change
//     if (requesterId === userId) {
//       return res.status(400).json({
//         message: "Owner cannot change their own role",
//       });
//     }

//     // 4️⃣ Find target membership
//     const targetMembership = await FarmUser.findOne({
//       farmId,
//       userId,
//       isActive: true,
//     });

//     if (!targetMembership) {
//       return res.status(404).json({
//         message: "User is not assigned to this farm",
//       });
//     }

//     // 5️⃣ Prevent modifying another owner
//     if (targetMembership.role === 'owner') {
//       return res.status(400).json({
//         message: "Cannot change role of another owner",
//       });
//     }

//     // 6️⃣ Prevent no-op update
//     if (targetMembership.role === role.toLowerCase()) {
//       return res.status(409).json({
//         message: "User already has this role",
//       });
//     }

//     const oldRole = targetMembership.role;
//     targetMembership.role = role.toLowerCase();
//     targetMembership.updatedBy = requesterId;
//     await targetMembership.save();

//     return res.status(200).json({
//       message: "User role updated successfully",
//       data: {
//         userId,
//         oldRole,
//         newRole: role.toLowerCase(),
//       },
//     });

//   } catch (err) {
//     console.error("Error updating farm user role:", err);
//     return res.status(500).json({ message: "Server error" });
//   }
// };

const getFarmData = async (req, res) => {
  /** @type {Farm | null} */
  const farm = await Farm.findById(req.params.farmId).lean()

  if (!farm) {
    return res.status(404).json({ message: "Farm not found" })
  }

  /** @type {FarmSummaryDTO} */
  const data = {
    id: farm._id.toString(),
    name: farm.name,
    location: farm.location,
    animalTypes: farm.animalTypes,
    capacity: farm.capacity,
  }

  res.json({
    message: "Farm fetched successfully",
    data: {
      ...data,
    }
  })
}

const getAllFarmData = async(req, res) => {
    try{
        const userId = req.user.id;
        
        // First, let's see all farms in the database
        const allFarms = await Farm.find({});
        
        // Now let's try the specific query
        const farmData = await Farm.find(
            {owner: userId}
        )
        
        // Let's also try a direct ObjectId comparison
        const mongoose = require('mongoose');
        const farmDataWithObjectId = await Farm.find({
            owner: new mongoose.Types.ObjectId(userId)
        });
        
        return res.status(200).json({
            message: "Got the farm data",
            data: farmData
        });
    }
    catch(err){
        console.error("DEBUG: Error in getFarmData:", err);
        res.status(500).json({message: "unable to fetch farm data"})
    }
}

module.exports = { getFarmUsers, assignFarmUser, removeFarmUser, getFarmData, getAllFarmData };
