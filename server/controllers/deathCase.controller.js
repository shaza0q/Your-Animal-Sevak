const DeathCaseService = require('../services/deathCase.service');
const mongoose = require("mongoose");
const DeceasedAnimalRecord = require('../models/deceasedAnimalRecord.schema');

class DeathCaseController {
  constructor() {
    this.deathCaseService = new DeathCaseService();
  }

  // Helper to extract user context from request
  _extractUserContext(req) {
    // Assuming user info is attached by auth middleware
    return {
      userId: req.user._id || req.user.id,
      role: req.user.role,
      farmId: req.user.farmId || req.user.farm,
      username: req.user.username || req.user.name,
    };
  }

  // Error handler
  _handleError(error, res) {
    console.error('Controller error:', error);
    
    // Handle custom exceptions
    switch (error.constructor.name) {
      case 'DeathCaseNotFoundException':
        return res.status(404).json({
          success: false,
          message: error.message,
          error: 'NOT_FOUND',
        });
        
      case 'InvalidWorkflowTransitionException':
      case 'ImmutableRecordException':
      case 'InvalidSectionException':
        return res.status(400).json({
          success: false,
          message: error.message,
          error: 'BAD_REQUEST',
        });
        
      case 'UnauthorizedWorkflowActionException':
      case 'UnauthorizedAccessException':
        return res.status(403).json({
          success: false,
          message: error.message,
          error: 'FORBIDDEN',
        });
        
      default:
        return res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: 'INTERNAL_ERROR',
        });
    }
  }

  // Create a new death case
  async createDeathCase(req, res) {
    try {
      const { animalId } = req.params;
      const userContext = this._extractUserContext(req);
      
      // Validate animalId
      if (!animalId || !mongoose.Types.ObjectId.isValid(animalId)) {
        return res.status(400).json({
          success: false,
          message: 'Valid animalId is required',
          error: 'INVALID_INPUT',
        });
      }
      
      const deathCase = await this.deathCaseService.createDeathCase(animalId, userContext);
      
      res.status(201).json({
        success: true,
        data: deathCase,
        message: 'Death case created successfully',
      });
    } catch (error) {
      this._handleError(error, res);
    }
  }

  // Get a specific death case
  async getDeathCase(req, res) {
    try {
      const { id } = req.params;
      const userContext = this._extractUserContext(req);
      
      // Validate caseId
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid case ID is required',
          error: 'INVALID_INPUT',
        });
      }
      
      const deathCase = await this.deathCaseService.getDeathCase(id, userContext);
      
      res.json({
        success: true,
        data: deathCase,
      });
    } catch (error) {
      this._handleError(error, res);
    }
  }

  // Update event section
  async updateEventSection(req, res) {
    try {
      const { id } = req.params;
      const userContext = this._extractUserContext(req);
      const payload = req.body;
      
      // Validate caseId
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid case ID is required',
          error: 'INVALID_INPUT',
        });
      }
      
      // Validate required fields
      const requiredFields = ['dateOfDeath', 'causeOfDeath', 'placeOfDeath'];
      const missingFields = requiredFields.filter(field => !payload[field]);
      
      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Missing required fields: ${missingFields.join(', ')}`,
          error: 'INVALID_INPUT',
        });
      }
      
      const deathCase = await this.deathCaseService.updateEventSection(id, payload, userContext);
      
      res.json({
        success: true,
        data: deathCase,
        message: 'Event section updated successfully',
      });
    } catch (error) {
      this._handleError(error, res);
    }
  }

  // Request veterinary review
  async requestVetReview(req, res) {
    try {
      const { id } = req.params;
      const userContext = this._extractUserContext(req);
      const { requiresVet = true } = req.body;
      
      // Validate caseId
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid case ID is required',
          error: 'INVALID_INPUT',
        });
      }
      
      const deathCase = await this.deathCaseService.requestVetReview(id, requiresVet, userContext);
      
      const message = requiresVet 
        ? 'Veterinary review requested' 
        : 'Proceeding without veterinary review';
      
      res.json({
        success: true,
        data: deathCase,
        message,
      });
    } catch (error) {
      this._handleError(error, res);
    }
  }

  // Confirm veterinary examination
  async confirmVet(req, res) {
    try {
      const { id } = req.params;
      const userContext = this._extractUserContext(req);
      const payload = req.body;
      
      // Validate caseId
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid case ID is required',
          error: 'INVALID_INPUT',
        });
      }
      
      // Validate required fields for vet confirmation (causeOfDeath is optional, partial updates allowed)
      // Service will validate if causeOfDeath is provided
      
      const deathCase = await this.deathCaseService.confirmVet(id, payload, userContext);
      
      res.json({
        success: true,
        data: deathCase,
        message: 'Veterinary confirmation completed',
      });
    } catch (error) {
      this._handleError(error, res);
    }
  }

  // Record disposal information
  async recordDisposal(req, res) {
    try {
      const { id } = req.params;
      const userContext = this._extractUserContext(req);
      const payload = req.body;
      
      // Validate caseId
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid case ID is required',
          error: 'INVALID_INPUT',
        });
      }
      
      // Validate required fields for disposal
      if (!payload.disposalMethod || !payload.disposalDate) {
        return res.status(400).json({
          success: false,
          message: 'disposalMethod and disposalDate are required',
          error: 'INVALID_INPUT',
        });
      }
      
      const deathCase = await this.deathCaseService.recordDisposal(id, payload, userContext);
      
      res.json({
        success: true,
        data: deathCase,
        message: 'Disposal recorded successfully',
      });
    } catch (error) {
      this._handleError(error, res);
    }
  }

  // Manager review and approval
  async managerReview(req, res) {
    try {
      const { id } = req.params;
      const userContext = this._extractUserContext(req);
      const { decision, comments, correctionRequests } = req.body;
      
      // Validate caseId
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Valid case ID is required',
          error: 'INVALID_INPUT',
        });
      }
      
      // Validate required fields
      if (!decision || !['approved', 'correction_needed'].includes(decision)) {
        return res.status(400).json({
          success: false,
          message: 'Valid decision (approved or correction_needed) is required',
          error: 'INVALID_INPUT',
        });
      }
      
      if (decision === 'correction_needed' && (!correctionRequests || correctionRequests.length === 0)) {
        return res.status(400).json({
          success: false,
          message: 'correctionRequests are required when decision is correction_needed',
          error: 'INVALID_INPUT',
        });
      }
      
      const deathCase = await this.deathCaseService.managerReview(
        id, 
        decision, 
        comments, 
        correctionRequests, 
        userContext
      );
      
      const message = decision === 'approved'
        ? 'Death case approved'
        : 'Correction requested';
      
      res.json({
        success: true,
        data: deathCase,
        message,
      });
    } catch (error) {
      this._handleError(error, res);
    }
  }

  // Get all death cases with filters
  async getDeathCases(req, res) {
    try {
      const userContext = this._extractUserContext(req);
      const filters = {
        workflowStatus: req.query.status,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        causeOfDeath: req.query.cause,
        type: req.query.type,
        skip: parseInt(req.query.skip) || 0,
        limit: parseInt(req.query.limit) || 50,
      };
      
      const deathCases = await this.deathCaseService.findDeathCases(filters, userContext);
      
      res.json({
        success: true,
        data: deathCases,
        count: deathCases.length,
        pagination: {
          skip: filters.skip,
          limit: filters.limit,
        },
      });
    } catch (error) {
      this._handleError(error, res);
    }
  }

  // Add attachment to death case
  async addAttachment(req, res) {
    try {
      const { id } = req.params;
      const userContext = this._extractUserContext(req);
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded',
          error: 'INVALID_INPUT',
        });
      }
      
      const deathCase = await this.deathCaseService.addAttachment(id, req.file, userContext);
      
      res.json({
        success: true,
        data: deathCase,
        message: 'Attachment added successfully',
      });
    } catch (error) {
      this._handleError(error, res);
    }
  }

  // Update compliance checklist
  async updateComplianceChecklist(req, res) {
    try {
      const { id } = req.params;
      const userContext = this._extractUserContext(req);
      const checklistItem = req.body;
      
      if (!checklistItem.label) {
        return res.status(400).json({
          success: false,
          message: 'Checklist item label is required',
          error: 'INVALID_INPUT',
        });
      }
      
      const deathCase = await this.deathCaseService.updateComplianceChecklist(id, checklistItem, userContext);
      
      res.json({
        success: true,
        data: deathCase,
        message: 'Compliance checklist updated',
      });
    } catch (error) {
      this._handleError(error, res);
    }
  }

  // Get workflow statistics
  async getWorkflowStats(req, res) {
    try {
      const userContext = this._extractUserContext(req);
      
      // Use existing `getMortalityStats` if available, otherwise aggregate
      const start = req.query.startDate ? new Date(req.query.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = req.query.endDate ? new Date(req.query.endDate) : new Date();
      const agg = await DeceasedAnimalRecord.aggregate([
        { $match: { farmId: new mongoose.Types.ObjectId(userContext.farmId), 'deathRecord.event.dateOfDeath': { $gte: start, $lte: end } } },
        { $group: { _id: null, totalDeaths: { $sum: 1 } } },
      ]);
      const stats = agg[0] || { totalDeaths: 0 };
      
      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      this._handleError(error, res);
    }
  }

  async addAttachments(req, res) {
    try {
        const { id } = req.params;
        const userContext = this._extractUserContext(req);
        
        if (!req.files || req.files.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'No files uploaded',
            error: 'INVALID_INPUT',
        });
        }
        
        // Process multiple files
        const deathCase = await this.deathCaseService.addAttachments(id, req.files, userContext);
        
        res.json({
        success: true,
        data: deathCase,
        message: `${req.files.length} attachment(s) added successfully`,
        });
    } catch (error) {
        this._handleError(error, res);
    }
  }
}

module.exports = DeathCaseController;