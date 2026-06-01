const mongoose = require('mongoose');

const DeceasedAnimalRecord = require('../models/deceasedAnimalRecord.schema');

const Animal = require('../models/animal');

const User = require('../models/user');

const AnimalUpdate = require('../models/animalUpdate');

const Farm = require('../models/farm');

const {

  DeathCaseNotFoundException,

  InvalidWorkflowTransitionException,

  UnauthorizedWorkflowActionException,

  ImmutableRecordException,

  InvalidSectionException,

} = require('../common/exceptions/deathCase.exceptions');

const { DEATH_CASE_WORKFLOW, WorkflowHelper } = require('../common/workflow/death-case.workflow');



class DeathCaseService {

  constructor() {

    // Use centralized workflow definitions

    this.VALID_TRANSITIONS = DEATH_CASE_WORKFLOW.VALID_TRANSITIONS;

    this.STATUS_PERMISSIONS = DEATH_CASE_WORKFLOW.STATUS_PERMISSIONS;

    this.AUTO_TRANSITIONS = DEATH_CASE_WORKFLOW.AUTO_TRANSITIONS;

    this.DEFAULTS = DEATH_CASE_WORKFLOW.DEFAULTS;

  }



  async createDeathCase(animalId, userContext) {

    try {

      // Check if death case already exists (idempotency)

      const existingCase = await DeceasedAnimalRecord.findOne({

        animalId: new mongoose.Types.ObjectId(animalId),

        farmId: userContext.farmId,

      });

      

      if (existingCase) {

        // Return existing case instead of throwing

        console.log(`Death case already exists for animal ${animalId}, returning existing case`);

        return existingCase;

      }



      // Fetch the animal with farm and owner information

      const animal = await Animal.findById(animalId).populate({

        path: 'farmId',

        populate: {

          path: 'owner',

          model: 'User'

        }

      });

      if (!animal) {

        throw new Error(`Animal with ID ${animalId} not found`);

      }



      // Fetch additional required data

      const farm = await Farm.findById(animal.farmId).populate('owner');

      

      // Get latest weight update for this animal

      const latestWeightUpdate = await AnimalUpdate.findOne({ 

        animalId: animalId, 

        updateType: 'Weight' 

      }).sort({ date: -1 });

      

      // Get latest breeding/reproductive update for this animal

      const latestBreedingUpdate = await AnimalUpdate.findOne({ 

        animalId: animalId, 

        updateType: 'Breeding' 

      }).sort({ date: -1 });



      const farmOwner = await User.findById(farm.owner);



      if (!farmOwner) {

        throw new Error(`Farm owner with ID ${farm.owner} not found`);

      }

      // Create frozen snapshot based on available data

      const snapshot = {

        tagNumber: animal.tagNumber,

        name: animal.name,

        type: animal.animalType,

        breed: animal.breed,

        gender: animal.gender,

        dateOfBirth: animal.dateOfBirth,

        farmName: farm?.name || 'Unknown Farm',

        ownerName: farmOwner?.full_name || 'Unknown Owner',

        ownerId: farm?.owner || null,

        lastKnownWeight: latestWeightUpdate?.weight || animal.weight || null,

        lastKnownLocation: farm?.location || null,

        reproductiveStatus: latestBreedingUpdate?.status || null,

      };



      // Create initial death record with valid enum values

      const deathRecord = {

        event: {

          dateOfDeath: new Date(),

          causeOfDeath: this.DEFAULTS.causeOfDeath, // Use 'unknown' from enum

          placeOfDeath: 'unknown', // Should come from your PLACE_OF_DEATH enum

          reportedById: userContext.userId,

        },

        handling: {

          necropsyPerformed: false,

        },

        tags: this.DEFAULTS.tags, // ['investigation_pending']

      };



      // Create the deceased animal record

      const deathCase = new DeceasedAnimalRecord({

        animalId: new mongoose.Types.ObjectId(animalId),

        farmId: userContext.farmId,

        recordVersion: 1,

        snapshot: snapshot,

        workflowStatus: 'draft',

        deathRecord: deathRecord,

        auditMetadata: {

          recordCreatedBy: userContext.username,

          recordCreatedById: userContext.userId,

          recordCreatedAt: new Date(),

          approvalStatus: 'pending',

          complianceChecklist: [],

          attachments: [],

          corrections: [],

          activityLog: [], // Initialize empty activity log

        },

      });



      // DON'T manually calculate derived fields - let schema hooks handle it

      

      // Save the record

      const savedRecord = await deathCase.save();

      

      // Add initial activity log entry (NOT correction)

      await this._addActivityLogEntry(

        savedRecord._id,

        userContext,

        'case_created',

        'system',

        null,

        'Death case created'

      );



      return savedRecord;

    } catch (error) {

      console.error('Error creating death case:', error);

      throw error;

    }

  }



  async updateEventSection(caseId, payload, userContext) {

    try {

      const deathCase = await this._getDeathCaseById(caseId, userContext.farmId);

      

      // Check if case is mutable

      this._ensureCaseIsMutable(deathCase);

      

      // Validate role and status

      if (!WorkflowHelper.canPerformAction(deathCase.workflowStatus, 'update_event', userContext.role)) {

        throw new UnauthorizedWorkflowActionException(

          userContext.role,

          'update_event',

        );

      }



      // Validate required fields for event section

      const requiredFields = WorkflowHelper.getRequiredFields('event');

      const missingFields = requiredFields.filter(field => !payload[field]);

      

      if (missingFields.length > 0) {

        throw new InvalidSectionException('event', `Missing required fields: ${missingFields.join(', ')}`);

      }



      // Validate cause of death against enum

      if (payload.causeOfDeath && !WorkflowHelper.isValidCauseOfDeath(payload.causeOfDeath)) {

        throw new InvalidSectionException('event', `Invalid cause of death: ${payload.causeOfDeath}`);

      }



      // Create a copy of current deathRecord for audit

      const previousEvent = deathCase.deathRecord?.event ? 

        JSON.parse(JSON.stringify(deathCase.deathRecord.event)) : null;



      // Update event section

      deathCase.deathRecord.event = {

        ...deathCase.deathRecord.event,

        ...payload,

        reportedById: userContext.userId,

      };



      // Remove investigation_pending tag if cause is determined

      if (payload.causeOfDeath && payload.causeOfDeath !== this.DEFAULTS.causeOfDeath) {

        deathCase.deathRecord.tags = deathCase.deathRecord.tags?.filter(tag => tag !== 'investigation_pending') || [];

      }



      // Update locationAtDeath if provided

      if (payload.locationAtDeath) {

        deathCase.locationAtDeath = payload.locationAtDeath;

      }



      // Determine next status based on completeness

      const isComplete = this._isEventSectionComplete(payload);

      let nextStatus;

      

      if (isComplete) {

        nextStatus = 'reported';

      } else {

        nextStatus = 'draft';

      }



      // Validate transition

      if (!WorkflowHelper.canTransition(deathCase.workflowStatus, nextStatus)) {

        throw new InvalidWorkflowTransitionException(deathCase.workflowStatus, nextStatus);

      }



      // Update status

      deathCase.workflowStatus = nextStatus;



      // Increment version for optimistic locking

      deathCase.recordVersion += 1;



      // Add activity log entry with proper changes

      const changes = this._extractChanges(previousEvent, deathCase.deathRecord.event);

      await this._addActivityLogEntry(

        caseId,

        userContext,

        'event_section_updated',

        'event',

        changes,

        `Event information ${isComplete ? 'completed' : 'updated'}`

      );



      // Save the updated record

      return await deathCase.save();

    } catch (error) {

      console.error('Error updating event section:', error);

      throw error;

    }

  }



  async requestVetReview(caseId, requiresVet, userContext) {

    try {

      const deathCase = await this._getDeathCaseById(caseId, userContext.farmId);

      

      // Check if case is mutable

      this._ensureCaseIsMutable(deathCase);

      

      // Validate role and status

      if (!WorkflowHelper.canPerformAction(deathCase.workflowStatus, 'request_vet', userContext.role)) {

        throw new UnauthorizedWorkflowActionException(

          userContext.role,

          'request_vet',

        );

      }



      // Determine next status

      let nextStatus;

      if (requiresVet) {

        nextStatus = 'vet_requested';

      } else {

        nextStatus = 'disposal_pending';

      }



      // Validate transition

      if (!WorkflowHelper.canTransition(deathCase.workflowStatus, nextStatus)) {

        throw new InvalidWorkflowTransitionException(deathCase.workflowStatus, nextStatus);

      }



      // Update status

      deathCase.workflowStatus = nextStatus;



      // Increment version

      deathCase.recordVersion += 1;



      // Add activity log entry

      await this._addActivityLogEntry(

        caseId,

        userContext,

        'vet_review_requested',

        'workflow',

        { requiresVet },

        `Veterinary review ${requiresVet ? 'requested' : 'not required'}`

      );



      return await deathCase.save();

    } catch (error) {

      console.error('Error requesting vet review:', error);

      throw error;

    }

  }



  async confirmVet(caseId, vetPayload, userContext) {

    try {

      const deathCase = await this._getDeathCaseById(caseId, userContext.farmId);

      

      // Check if case is mutable

      this._ensureCaseIsMutable(deathCase);

      

      // Validate role and status

      if (!WorkflowHelper.canPerformAction(deathCase.workflowStatus, 'confirm_vet', userContext.role)) {

        throw new UnauthorizedWorkflowActionException(

          userContext.role,

          'confirm_vet',

        );

      }



      // Validate transition to vet_confirmed

      if (!WorkflowHelper.canTransition(deathCase.workflowStatus, 'vet_confirmed')) {

        throw new InvalidWorkflowTransitionException(deathCase.workflowStatus, 'vet_confirmed');

      }



      // Validate cause of death from vet

      if (vetPayload.causeOfDeath && !WorkflowHelper.isValidCauseOfDeath(vetPayload.causeOfDeath)) {

        throw new InvalidSectionException('vet', `Invalid cause of death: ${vetPayload.causeOfDeath}`);

      }



      // Save previous values for audit

      const previousCause = deathCase.deathRecord?.event?.causeOfDeath;

      const previousHandling = deathCase.deathRecord?.handling ? 

        JSON.parse(JSON.stringify(deathCase.deathRecord.handling)) : null;



      // Update medical context with vet confirmation

      if (!deathCase.medicalContext) {

        deathCase.medicalContext.attendingVetId = {};

      }

      deathCase.medicalContext.attendingVetId = userContext.userId;

      deathCase.medicalContext.lastVetVisitDate = new Date();

      deathCase.medicalContext.lastVetVisitReason = 'death_confirmation';



      // Update death record with vet confirmation

      if (vetPayload.causeOfDeath) {

        deathCase.deathRecord.event.causeOfDeath = vetPayload.causeOfDeath;

        deathCase.deathRecord.event.causeDetails = vetPayload.causeDetails;

        deathCase.deathRecord.event.confirmedById = userContext.userId;

        deathCase.deathRecord.event.confirmedAt = new Date();

      }



      // Update necropsy info if provided

      if (vetPayload.necropsyPerformed !== undefined) {

        deathCase.deathRecord.handling = {

          ...(deathCase.deathRecord.handling || {}),

          necropsyPerformed: vetPayload.necropsyPerformed,

          labSamplesTaken: vetPayload.labSamplesTaken || [],

        };

        

        if (vetPayload.necropsyFindings) {

          deathCase.deathRecord.handling.necropsyFindings = vetPayload.necropsyFindings;

        }

        if (vetPayload.necropsyReportLink) {

          deathCase.deathRecord.handling.necropsyReportLink = vetPayload.necropsyReportLink;

        }

      }



      // Update status to vet_confirmed

      deathCase.workflowStatus = 'vet_confirmed';



      // Apply auto-transition to disposal_pending

      const autoTransition = WorkflowHelper.getAutoTransition('vet_confirmed');

      if (autoTransition && WorkflowHelper.canTransition('vet_confirmed', autoTransition)) {

        deathCase.workflowStatus = autoTransition;

      }



      // Increment version - once for vet confirmation, once more if auto-transitioned

      let versionIncrement = 1;

      if (autoTransition && deathCase.workflowStatus === autoTransition) {

        versionIncrement += 1;

      }

      deathCase.recordVersion += versionIncrement;



      // Prepare changes for audit

      const changes = {};

      if (previousCause !== deathCase.deathRecord.event.causeOfDeath) {

        changes.causeOfDeath = {

          from: previousCause,

          to: deathCase.deathRecord.event.causeOfDeath,

        };

      }

      

      const handlingChanges = this._extractChanges(previousHandling, deathCase.deathRecord.handling);

      Object.assign(changes, handlingChanges);



      // Add activity log entry

      await this._addActivityLogEntry(

        caseId,

        userContext,

        'vet_confirmation_completed',

        'vet',

        changes,

        'Veterinary confirmation completed'

      );



      // Add separate log for auto-transition if it happened

      if (autoTransition && deathCase.workflowStatus === autoTransition) {

        await this._addActivityLogEntry(

          caseId,

          userContext,

          'auto_transition',

          'workflow',

          { from: 'vet_confirmed', to: autoTransition },

          'Auto-transitioned to disposal pending'

        );

      }



      return await deathCase.save();

    } catch (error) {

      console.error('Error confirming vet:', error);

      throw error;

    }

  }



  async recordDisposal(caseId, disposalPayload, userContext) {

    try {

      const deathCase = await this._getDeathCaseById(caseId, userContext.farmId);

      

      // Check if case is mutable

      this._ensureCaseIsMutable(deathCase);

      

      // Validate role and status

      if (!WorkflowHelper.canPerformAction(deathCase.workflowStatus, 'record_disposal', userContext.role)) {

        throw new UnauthorizedWorkflowActionException(

          userContext.role,

          'record_disposal',

        );

      }



      // Validate disposal payload

      const requiredFields = WorkflowHelper.getRequiredFields('disposal');

      const missingFields = requiredFields.filter(field => !disposalPayload[field]);

      

      if (missingFields.length > 0) {

        throw new InvalidSectionException('disposal', `Missing required fields: ${missingFields.join(', ')}`);

      }



      // Validate disposal method against enum

      if (disposalPayload.disposalMethod && !WorkflowHelper.isValidDisposalMethod(disposalPayload.disposalMethod)) {

        throw new InvalidSectionException('disposal', `Invalid disposal method: ${disposalPayload.disposalMethod}`);

      }



      // Save previous handling for audit

      const previousHandling = deathCase.deathRecord?.handling ? 

        JSON.parse(JSON.stringify(deathCase.deathRecord.handling)) : null;



      // Update disposal information (FIXED: Handle undefined)

      deathCase.deathRecord.handling = {

        ...(deathCase.deathRecord.handling || {}),

        ...disposalPayload,

      };



      // Validate transition to disposal_recorded

      if (!WorkflowHelper.canTransition(deathCase.workflowStatus, 'disposal_recorded')) {

        throw new InvalidWorkflowTransitionException(deathCase.workflowStatus, 'disposal_recorded');

      }



      // Update status

      deathCase.workflowStatus = 'disposal_recorded';



      // Check for auto-transition

      const autoTransition = WorkflowHelper.getAutoTransition('disposal_recorded');

      if (autoTransition) {

        if (WorkflowHelper.canTransition('disposal_recorded', autoTransition)) {

          deathCase.workflowStatus = autoTransition;

        }

      }



      // Increment version - once for disposal recording, once more if auto-transitioned

      let versionIncrement = 1;

      if (autoTransition && deathCase.workflowStatus === autoTransition) {

        versionIncrement += 1;

      }

      deathCase.recordVersion += versionIncrement;



      // Add activity log entry for disposal

      const changes = this._extractChanges(previousHandling, deathCase.deathRecord.handling);

      await this._addActivityLogEntry(

        caseId,

        userContext,

        'disposal_recorded',

        'disposal',

        changes,

        'Disposal recorded'

      );



      // Add activity log entry for auto-transition if applicable

      if (autoTransition && deathCase.workflowStatus === autoTransition) {

        await this._addActivityLogEntry(

          caseId,

          userContext,

          'auto_transition',

          'workflow',

          { from: 'disposal_recorded', to: autoTransition },

          'Auto-transitioned to review pending'

        );

      }



      return await deathCase.save();

    } catch (error) {

      console.error('Error recording disposal:', error);

      throw error;

    }

  }



  async managerReview(caseId, decision, comments, correctionRequests, userContext) {

    try {

      const deathCase = await this._getDeathCaseById(caseId, userContext.farmId);

      

      // Check if case is mutable

      this._ensureCaseIsMutable(deathCase);

      

      // Validate role and status

      if (!WorkflowHelper.canPerformAction(deathCase.workflowStatus, 'review', userContext.role)) {

        throw new UnauthorizedWorkflowActionException(

          userContext.role,

          'review',

        );

      }



      // Save previous approval status for audit

      const previousApprovalStatus = deathCase.auditMetadata.approvalStatus;



      // Update audit metadata with review

      deathCase.auditMetadata.reviewedBy = userContext.username;

      deathCase.auditMetadata.reviewedAt = new Date();

      deathCase.auditMetadata.approvalStatus = decision === 'approved' ? 'approved' : 'requires_correction';

      

      if (comments) {

        deathCase.auditMetadata.approvalNotes = comments;

      }



      let nextStatus;

      if (decision === 'approved') {

        nextStatus = 'approved';

        

        // Mark all compliance checklist items as completed if not already

        if (deathCase.auditMetadata.complianceChecklist && deathCase.auditMetadata.complianceChecklist.length > 0) {

          deathCase.auditMetadata.complianceChecklist.forEach((item) => {

            item.completed = true;

            item.completedAt = new Date();

            item.completedBy = userContext.username;

          });

        }

      } else {

        nextStatus = 'correction_needed';

        

        // Add correction requests to audit metadata (ONLY for corrections!)

        if (correctionRequests && correctionRequests.length > 0) {

          const correctionEntry = {

            timestamp: new Date(),

            userId: userContext.userId,

            userName: userContext.username,

            reason: 'Manager requested corrections',

            changes: correctionRequests.map(req => ({

              field: req.field,

              from: null, // We don't know previous value for correction requests

              to: req.expectedValue,

              note: req.reason,

            })),

          };

          

          deathCase.auditMetadata.corrections.push(correctionEntry);

        }

      }



      // Validate transition

      if (!WorkflowHelper.canTransition(deathCase.workflowStatus, nextStatus)) {

        throw new InvalidWorkflowTransitionException(deathCase.workflowStatus, nextStatus);

      }



      // Update status

      deathCase.workflowStatus = nextStatus;



      // Increment version

      deathCase.recordVersion += 1;



      // Add activity log entry (NOT correction!)

      await this._addActivityLogEntry(

        caseId,

        userContext,

        'manager_review',

        'review',

        { 

          approvalStatus: {

            from: previousApprovalStatus,

            to: deathCase.auditMetadata.approvalStatus,

          },

          decision,

          comments,

        },

        `Manager review: ${decision}`

      );



      return await deathCase.save();

    } catch (error) {

      console.error('Error in manager review:', error);

      throw error;

    }

  }



  async getDeathCase(caseId, userContext) {

    try {

      const deathCase = await this._getDeathCaseById(caseId, userContext.farmId);

      

      // Compute permissions using centralized workflow

      const permissions = this._computePermissions(deathCase, userContext.role);

      return Object.assign({}, deathCase.toObject ? deathCase.toObject() : deathCase, { permissions });

    } catch (error) {

      console.error('Error getting death case:', error);

      throw error;

    }

  }



  async addAttachments(caseId, files, userContext) {

    try {

      const deathCase = await this._getDeathCaseById(caseId, userContext.farmId);

      this._ensureCaseIsMutable(deathCase);

      

      const attachments = files.map(file => ({

        name: file.filename || file.originalname,

        originalName: file.originalname,

        type: file.mimetype,

        url: file.path || `/uploads/death-cases/${file.filename}`,

        size: file.size,

        uploadedAt: new Date(),

        uploadedBy: userContext.username,

        category: this._determineCategory(file.mimetype),

      }));

      

      const updatedCase = await DeceasedAnimalRecord.findOneAndUpdate(

        { _id: deathCase._id, farmId: userContext.farmId },

        {

          $inc: { recordVersion: 1 },

          $push: {

            'auditMetadata.attachments': { $each: attachments } // Use $each for multiple

          },

          $setOnInsert: { 'auditMetadata.attachments': [] }

        },

        { new: true, runValidators: true }

      );

      

      if (!updatedCase) {

        throw new DeathCaseNotFoundException(caseId);

      }

      

      await this._addActivityLogEntry(

        caseId,

        userContext,

        'attachments_added',

        'attachments',

        { count: files.length },

        `${files.length} attachment(s) added`

      );



      return updatedCase;

    } catch (error) {

      console.error('Error adding attachments:', error);

      throw error;

    }

  }



  _determineCategory(mimetype) {

    if (mimetype.startsWith('image/')) return 'image';

    if (mimetype === 'application/pdf') return 'document';

    if (mimetype.includes('spreadsheet') || mimetype.includes('excel')) return 'spreadsheet';

    if (mimetype.includes('word') || mimetype.includes('document')) return 'document';

    if (mimetype === 'text/plain') return 'text';

    return 'other';

  }



  // ==================== PRIVATE HELPER METHODS ====================



  async _getDeathCaseById(caseId, farmId) {

    const deathCase = await DeceasedAnimalRecord.findOne({

      _id: new mongoose.Types.ObjectId(caseId),

      farmId: new mongoose.Types.ObjectId(farmId),

    });



    if (!deathCase) {

      throw new DeathCaseNotFoundException(caseId);

    }



    return deathCase;

  }



  _ensureCaseIsMutable(deathCase) {

    if (deathCase.workflowStatus === 'approved' || 

        deathCase.workflowStatus === 'archived') {

      throw new ImmutableRecordException(deathCase._id.toString());

    }

  }



  _isEventSectionComplete(payload) {

    const requiredFields = WorkflowHelper.getRequiredFields('event');

    return requiredFields.every(field => payload[field] !== undefined && payload[field] !== null);

  }



  // Add to activity log (NOT corrections)

  async _addActivityLogEntry(caseId, userContext, action, section, changes, comments) {

    const activityEntry = {

      timestamp: new Date(),

      userId: userContext.userId,

      userName: userContext.username,

      action,

      section,

      changes: changes ? this._prepareChangesForActivityLog(changes) : [],

      comments,

    };



    await DeceasedAnimalRecord.updateOne(

      { _id: new mongoose.Types.ObjectId(caseId) },

      {

        $push: { 'auditMetadata.activityLog': activityEntry },

      }

    );

  }



  // Add to corrections (ONLY for manager-requested corrections)

  async _addCorrectionEntry(caseId, userContext, reason, changes) {

    const correctionEntry = {

      timestamp: new Date(),

      userId: userContext.userId,

      userName: userContext.username,

      reason,

      changes: changes ? this._prepareChangesForCorrection(changes) : [],

    };



    await DeceasedAnimalRecord.updateOne(

      { _id: new mongoose.Types.ObjectId(caseId) },

      {

        $push: { 'auditMetadata.corrections': correctionEntry },

      }

    );

  }



  _extractChanges(previous, current) {

    const changes = {};

    

    if (!previous && !current) return changes;

    

    const allKeys = new Set([

      ...Object.keys(previous || {}),

      ...Object.keys(current || {}),

    ]);

    

    allKeys.forEach((key) => {

      const prevValue = previous?.[key];

      const currValue = current?.[key];

      

      // Deep comparison for objects/arrays

      if (JSON.stringify(prevValue) !== JSON.stringify(currValue)) {

        changes[key] = {

          from: prevValue,

          to: currValue,

        };

      }

    });

    

    return changes;

  }



  _prepareChangesForActivityLog(changes) {

    const activityChanges = [];

    

    for (const [field, change] of Object.entries(changes)) {

      if (change && typeof change === 'object' && 'from' in change && 'to' in change) {

        activityChanges.push({

          field,

          from: change.from,

          to: change.to,

          note: `Changed from ${JSON.stringify(change.from)} to ${JSON.stringify(change.to)}`,

        });

      } else {

        // For simple value changes

        activityChanges.push({

          field,

          from: null,

          to: change,

          note: `Set to ${JSON.stringify(change)}`,

        });

      }

    }

    

    return activityChanges;

  }



  _prepareChangesForCorrection(changes) {

    // Corrections are already in the right format from managerReview

    return changes;

  }



  _computePermissions(deathCase, userRole) {

    const permissions = {

      canEdit: false,

      canApprove: false,

      canRequestCorrection: false,

      nextActions: [],

      lockedReasons: [],

    };



    const status = deathCase.workflowStatus;

    

    // Check if user can access this status at all

    if (!WorkflowHelper.canPerformAction(status, 'any', userRole)) {

      permissions.lockedReasons.push(`Role ${userRole} cannot access ${status} status`);

      return permissions;

    }



    // Get status permissions from centralized workflow

    const statusPermissions = this.STATUS_PERMISSIONS[status];

    

    if (!statusPermissions) {

      permissions.lockedReasons.push(`Invalid status: ${status}`);

      return permissions;

    }



    // Determine next available actions based on what user can actually do

    permissions.nextActions = statusPermissions.actions.filter(action => 

      WorkflowHelper.canPerformAction(status, action, userRole)

    );

    

    // Determine specific permissions

    permissions.canEdit = WorkflowHelper.canPerformAction(status, 'update_event', userRole);

    permissions.canApprove = WorkflowHelper.canPerformAction(status, 'review', userRole);

    permissions.canRequestCorrection = WorkflowHelper.canPerformAction(status, 'review', userRole);



    // Check if case is immutable

    if (status === 'approved' || status === 'archived') {

      permissions.lockedReasons.push(`Case is ${status} and cannot be modified`);

      permissions.canEdit = false;

      permissions.canApprove = false;

      permissions.canRequestCorrection = false;

      permissions.nextActions = [];

    }



    return permissions;

  }



  // ==================== PUBLIC METHODS FOR YOUR EXISTING SCHEMA ====================



  async addAttachment(caseId, attachment, userContext) {

    try {

      const deathCase = await this._getDeathCaseById(caseId, userContext.farmId);

      

      // Check if case is mutable

      this._ensureCaseIsMutable(deathCase);

      

      // Create the complete attachment object

      const newAttachment = {

        name: attachment.filename || attachment.originalname || attachment.name,

        originalName: attachment.originalname || attachment.name,

        type: attachment.mimetype,

        url: attachment.path || `/uploads/death-cases/${attachment.filename}` || attachment.url,

        size: attachment.size,

        uploadedAt: new Date(),

        uploadedBy: userContext.username,

        category: this._determineCategory(attachment.mimetype),

      };

      

      // Increment version AND push attachment in ONE atomic operation

      const updatedCase = await DeceasedAnimalRecord.findOneAndUpdate(

        { 

          _id: deathCase._id,

          farmId: userContext.farmId 

        },

        {

          $inc: { recordVersion: 1 }, // Atomic increment

          $push: { 

            'auditMetadata.attachments': newAttachment 

          },

          // Ensure attachments array exists

          $setOnInsert: {

            'auditMetadata.attachments': []

          }

        },

        {

          new: true, // Return updated document

          runValidators: true // Run schema validators

        }

      );

      

      if (!updatedCase) {

        throw new DeathCaseNotFoundException(caseId);

      }

      

      // Add activity log entry

      await this._addActivityLogEntry(

        caseId,

        userContext,

        'attachment_added',

        'attachments',

        { filename: newAttachment.name },

        'Attachment added'

      );



      return updatedCase;

    } catch (error) {

      console.error('Error adding attachment:', error);

      throw error;

    }

  }



  async updateComplianceChecklist(caseId, checklistItem, userContext) {

    try {

      const deathCase = await this._getDeathCaseById(caseId, userContext.farmId);

      

      // Check if case is mutable

      this._ensureCaseIsMutable(deathCase);

      

      // Initialize checklist if not exists

      if (!deathCase.auditMetadata.complianceChecklist) {

        deathCase.auditMetadata.complianceChecklist = [];

      }

      

      // Find and update checklist item

      const itemIndex = deathCase.auditMetadata.complianceChecklist.findIndex(

        item => item.label === checklistItem.label

      );

      

      if (itemIndex >= 0) {

        // Save previous value for audit

        const previousItem = { ...deathCase.auditMetadata.complianceChecklist[itemIndex] };

        

        // Update existing item

        deathCase.auditMetadata.complianceChecklist[itemIndex] = {

          ...deathCase.auditMetadata.complianceChecklist[itemIndex],

          completed: checklistItem.completed,

          completedAt: checklistItem.completed ? new Date() : null,

          completedBy: checklistItem.completed ? userContext.username : null,

          notes: checklistItem.notes,

        };

        

        // Add activity log entry

        await this._addActivityLogEntry(

          caseId,

          userContext,

          'compliance_checklist_updated',

          'compliance',

          {

            [checklistItem.label]: {

              from: previousItem.completed,

              to: checklistItem.completed,

            },

          },

          'Compliance checklist updated'

        );

      } else {

        // Add new item

        deathCase.auditMetadata.complianceChecklist.push({

          label: checklistItem.label,

          required: checklistItem.required || false,

          completed: checklistItem.completed || false,

          completedAt: checklistItem.completed ? new Date() : null,

          completedBy: checklistItem.completed ? userContext.username : null,

          notes: checklistItem.notes,

        });

        

        // Add activity log entry

        await this._addActivityLogEntry(

          caseId,

          userContext,

          'compliance_checklist_item_added',

          'compliance',

          { [checklistItem.label]: { to: checklistItem.completed } },

          'Compliance checklist item added'

        );

      }

      

      // Increment version

      deathCase.recordVersion += 1;



      return await deathCase.save();

    } catch (error) {

      console.error('Error updating compliance checklist:', error);

      throw error;

    }

  }



  async findDeathCases(filters, userContext) {

    try {

      const query = { farmId: userContext.farmId };

      

      // Apply filters

      if (filters.workflowStatus) {

        query.workflowStatus = filters.workflowStatus;

      }

      

      if (filters.startDate || filters.endDate) {

        query['deathRecord.event.dateOfDeath'] = {};

        if (filters.startDate) {

          query['deathRecord.event.dateOfDeath'].$gte = new Date(filters.startDate);

        }

        if (filters.endDate) {

          query['deathRecord.event.dateOfDeath'].$lte = new Date(filters.endDate);

        }

      }

      

      if (filters.causeOfDeath) {

        query['deathRecord.event.causeOfDeath'] = filters.causeOfDeath;

      }

      

      if (filters.type) {

        query['snapshot.type'] = filters.type;

      }

      

      // Execute query

      const deathCases = await DeceasedAnimalRecord.find(query)

        .sort({ 'deathRecord.event.dateOfDeath': -1 })

        .skip(filters.skip || 0)

        .limit(filters.limit || 50)

        .lean();

      

      // Add permissions to each case

      return deathCases.map(caseItem => {

        const permissions = this._computePermissions(caseItem, userContext.role);

        return Object.assign({}, caseItem, { permissions });

      });

    } catch (error) {

      console.error('Error finding death cases:', error);

      throw error;

    }

  }

}



module.exports = DeathCaseService;