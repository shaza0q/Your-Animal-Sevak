const farmUser = require('../models/farmUser');
const newUser = require('../models/newUsers')

const getUserById = async(req,res)=>{
    const id = req.user.id;
    const user = await newUser.findById(id);
    return   res.status(201).json(user);
}

const searchUsers = async (req, res) => {
  try {
    const { query, farmId } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        message: "Search query must be at least 2 characters",
      });
    }

    // 1️⃣ Find matching users
    const users = await newUser.find({
      $or: [
        { email: { $regex: query, $options: 'i' } },
        { full_name: { $regex: query, $options: 'i' } },
      ],
      role: { $nin: ['owner', 'admin'] }
    })
      .select('_id full_name email role')
      .limit(10)
      .lean();

    // 2️⃣ Optional: filter out users already assigned to farm
    let filteredUsers = users;

    if (farmId) {
      const assignedUsers = await farmUser.find({
        farmId,
        isActive: true,
        role: { $nin: ['owner', 'admin'] }
      }).select('userId');

      const assignedUserIds = new Set(
        assignedUsers.map((u) => u.userId.toString())
      );

      filteredUsers = users.filter(
        (u) => !assignedUserIds.has(u._id.toString())
      );
    }

    return res.status(200).json({
      message: "Users retrieved successfully",
      data: filteredUsers.map((u) => ({
        id: u._id,
        name: u.full_name,
        email: u.email,
        role: u.role,
      })),
    });

  } catch (err) {
    console.error("Error searching users:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
    getUserById,
    searchUsers
}
