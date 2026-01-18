const assignmentService = require("../services/animalAssignment.service");

/**
 * GET /api/animals/:animalId/assignments
 */
async function getAssignments(req, res) {
  const { animalId } = req.params;

  try {
    const assignments = await assignmentService.getActiveAssignments(animalId);
    return res.json(assignments);
  } catch (error) {
    console.error('Error fetching animal assignments:', error);
    // Don't throw error, return empty array instead
    return res.json([]);
  }
}

/**
 * POST /api/animals/:animalId/assignments
 */
async function assignUser(req, res) {
  try{
    const { animalId } = req.params;
    const { workerId, role } = req.body;
  
    if (!workerId || !role) {
      return res.status(400).json({
        message: "workerId and role are required",
      });
    }
  
    if (!["caretaker", "veterinarian", "staff", "owner"].includes(role)) {
      return res.status(400).json({
        message: "Invalid role",
      });
    }
  
    await assignmentService.assignUserToAnimal({
      animalId,
      workerId,
      role,
    });
  
    return res.status(201).json({
      message: "Assignment successful",
    });

  }
  catch(error){
    console.error('Error assigning user to animal:', error);
    throw error
    
  }
}

/**
 * POST /api/animals/:animalId/assignments/:assignmentId/unassign
 */
async function unassignUser(req, res) {
  const { animalId, assignedUserId } = req.params;
  
  // assignmentId is actually the userId in our URL structure
  // We need to determine the role from the request body or query
  const { role } = req.body;

  if (!role) {
    return res.status(400).json({
      message: "Role is required in request body",
    });
  }

  console.log('-------unassign request:', { animalId, userId: assignedUserId, role });

  const result = await assignmentService.unassignAnimalUser({ 
    animalId, 
    userId: assignedUserId, 
    role 
  });

  console.log('----------result from controller', result);

  if (!result) {
    return res.status(404).json({
      message: "Active assignment not found",
    });
  }

  return res.json({
    message: "Assignment removed",
  });
}

module.exports = {
  getAssignments,
  assignUser,
  unassignUser,
};