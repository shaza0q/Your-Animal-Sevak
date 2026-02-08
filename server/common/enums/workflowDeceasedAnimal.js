const DECEASED_WORKFLOW_STATUS = {
    DRAFT: 'draft', // Draft
    REPORTED: 'reported',        // Staff reported death
    VET_REQUESTED: 'vet_requested',   // Waiting for vet
    VET_CONFIRMED: 'vet_confirmed',   // Vet completed section
    DISPOSAL_PENDING: 'disposal_pending', // Waiting for disposal info
    DISPOSAL_RECORDED: 'disposal_recorded', // Disposal info added
    REVIEW_PENDING: 'review_pending',  // Ready for review
    CORRECTION_NEEDED: 'correction_needed', // Needs fixes
    APPROVED: 'approved',        // Case closed
    ARCHIVED: 'archived'         // Archived case
}

module.exports = { DECEASED_WORKFLOW_STATUS };