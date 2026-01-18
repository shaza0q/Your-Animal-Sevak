const farmUserService = require("../services/farmUser.service");

async function searchUsers(req, res) {
  const { farmId } = req.params;
  const { q, roles, excludeUserIds } = req.query;

  const roleArray = roles ? roles.split(",") : [];
  const excludeArray = excludeUserIds ? excludeUserIds.split(",") : [];

  try {
    console.log('--------------query', q)
    console.log('--------------roles', roles)
    console.log('--------------excludeUserIds', excludeUserIds)
    console.log('--------------farmId', farmId)

    const users = await farmUserService.searchFarmUsers({
      farmId,
      q,
      roles: roleArray,
      excludeUserIds: excludeArray,
    });

    console.log('---------------users', users)
    return res.json({ data: users });
  } catch (error) {
    console.error('Error searching farm users:', error);
    // Don't throw error, return empty array instead
    throw error
    return res.json({ data: [] });
  }
}

module.exports = {
  searchUsers,
};
