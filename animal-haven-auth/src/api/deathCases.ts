import { api } from "@/lib/api";
import { DeathCase, DeathCaseListResponse, WorkflowStatus } from "@/types/deathCase";

export interface ListDeathCasesParams {
  status?: WorkflowStatus | WorkflowStatus[]; // Single status or array
  assignedToMe?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "deathDate" | "caseNumber";
  sortOrder?: "asc" | "desc";
  farmId?: string;
  species?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const DeathCaseAPI = {
  list: async (
    params?: ListDeathCasesParams, 
    signal?: AbortSignal
  ): Promise<{ data: DeathCaseListResponse }> => {
    // Convert array status to comma-separated string if needed
    const apiParams = { ...params };
    if (Array.isArray(apiParams.status)) {
      apiParams.status = apiParams.status.join(',');
    }
    
    return api.get("/api/death-cases", { 
      params: apiParams,
      signal 
    });
  },

  get: (id: string): Promise<{ data: DeathCase }> => {
    return api.get(`/api/death-cases/${id}`);
  },

  // Step 1: Create draft/report death
  createForAnimal: (animalId: string, data?: Partial<DeathCase>) => {
    return api.post(`/api/animals/${animalId}/death-case`, data);
  },

  // Step 1: Update death event details
  updateEventInfo: (caseId: string, eventInfo: any) => {
    return api.patch(`/api/death-cases/${caseId}/event`, eventInfo);
  },

  // Step 1: Submit initial report
  submitReport: (caseId: string) => {
    return api.post(`/api/death-cases/${caseId}/submit-report`);
  },

  // Step 2: Request vet confirmation
  requestVet: (caseId: string, vetId?: string) => {
    return api.post(`/api/death-cases/${caseId}/request-vet`, { vetId });
  },

  // Step 2: Vet confirmation
  vetConfirm: (caseId: string, confirmation: any) => {
    return api.post(`/api/death-cases/${caseId}/vet-confirm`, confirmation);
  },

  // Step 3: Update disposal information
  updateDisposalInfo: (caseId: string, disposalInfo: any) => {
    return api.patch(`/api/death-cases/${caseId}/disposal`, disposalInfo);
  },

  // Step 4: Submit for review
  submitForReview: (caseId: string) => {
    return api.post(`/api/death-cases/${caseId}/submit-review`);
  },

  // Step 4: Review (approve or request correction)
  review: (caseId: string, review: { 
    decision: "approved" | "correction_needed"; 
    comments?: string; 
    correctionRequests?: any[];
  }) => {
    return api.post(`/api/death-cases/${caseId}/review`, review);
  },

  // Step 5: Final approval
  approve: (caseId: string) => {
    return api.post(`/api/death-cases/${caseId}/approve`);
  },

  // Additional endpoints
  addAttachment: (caseId: string, attachment: any) => {
    return api.post(`/api/death-cases/${caseId}/attachments`, attachment);
  },

  deleteAttachment: (caseId: string, attachmentId: string) => {
    return api.delete(`/api/death-cases/${caseId}/attachments/${attachmentId}`);
  },

  getAuditTrail: (caseId: string) => {
    return api.get(`/api/death-cases/${caseId}/audit-trail`);
  },

  updateChecklist: (caseId: string, checklistId: string, completed: boolean) => {
    return api.patch(`/api/death-cases/${caseId}/checklist/${checklistId}`, { completed });
  },

  // Stats endpoint
  getStats: (params?: { farmId?: string; dateFrom?: string; dateTo?: string }) => {
    return api.get("/api/death-cases/stats", { params });
  },

  // Bulk actions
  exportCases: (params?: ListDeathCasesParams) => {
    return api.get("/api/death-cases/export", { 
      params,
      responseType: 'blob'
    });
  },
};