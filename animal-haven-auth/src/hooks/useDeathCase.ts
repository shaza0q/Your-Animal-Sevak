import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/sonner";
import { getErrorMessage } from "@/lib/errorUtils";
import {
  DeathCaseAPI,
  BackendDeathCaseRecord,
  BackendPagination,
  mapBackendToDeathCase,
  UpdateEventPayload,
  ConfirmVetPayload,
  RecordDisposalPayload,
  ManagerReviewPayload,
} from "@/api/deathCases";
import { DeathCase } from "@/types/deathCase";

// ─── List ─────────────────────────────────────────────────────────────────────

interface DeathCasesResponse {
  data: DeathCase[];
  pagination: BackendPagination;
}

export function useDeathCases(farmId: string | undefined, page = 1, limit = 20) {
  return useQuery<DeathCasesResponse>({
    queryKey: ["death-cases", farmId, page, limit],
    queryFn: async () => {
      const res = await DeathCaseAPI.list({ farmId, page, limit });
      const payload = res.data as {
        data: BackendDeathCaseRecord[];
        pagination: BackendPagination;
      };
      return {
        data: payload.data.map(mapBackendToDeathCase),
        pagination: payload.pagination,
      };
    },
    enabled: !!farmId,
    staleTime: 30_000,
  });
}

// ─── Single ───────────────────────────────────────────────────────────────────

export function useDeathCase(caseId: string | undefined) {
  return useQuery<DeathCase>({
    queryKey: ["death-case", caseId],
    queryFn: async () => {
      const res = await DeathCaseAPI.get(caseId!);
      const payload = res.data as { data: BackendDeathCaseRecord };
      return mapBackendToDeathCase(payload.data);
    },
    enabled: !!caseId,
    staleTime: 30_000,
  });
}

// ─── Create ───────────────────────────────────────────────────────────────────

export function useCreateDeathCase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (animalId: string) =>
      DeathCaseAPI.createForAnimal(animalId).then((r) => {
        const payload = r.data as { data: BackendDeathCaseRecord };
        return payload.data;
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["death-cases"] });
    },
    onError: (error) => {
      toast.error("Failed to create death case", {
        description: getErrorMessage(error),
      });
    },
  });
}

// ─── Update event section ─────────────────────────────────────────────────────

interface UpdateEventVars extends UpdateEventPayload {
  caseId: string;
}

export function useUpdateDeathCaseEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ caseId, ...payload }: UpdateEventVars) =>
      DeathCaseAPI.updateEventInfo(caseId, payload),
    onSuccess: (_, { caseId }) => {
      queryClient.invalidateQueries({ queryKey: ["death-case", caseId] });
      queryClient.invalidateQueries({ queryKey: ["death-cases"] });
    },
    onError: (error) => {
      toast.error("Could not update case status", {
        description: getErrorMessage(error),
      });
    },
  });
}

// ─── Request vet ──────────────────────────────────────────────────────────────

interface RequestVetVars {
  caseId: string;
  requiresVet: boolean;
}

export function useRequestVet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ caseId, requiresVet }: RequestVetVars) =>
      DeathCaseAPI.requestVet(caseId, requiresVet),
    onSuccess: (_, { caseId }) => {
      queryClient.invalidateQueries({ queryKey: ["death-case", caseId] });
      queryClient.invalidateQueries({ queryKey: ["death-cases"] });
    },
    onError: (error) => {
      toast.error("Could not update case status", {
        description: getErrorMessage(error),
      });
    },
  });
}

// ─── Confirm vet ──────────────────────────────────────────────────────────────

interface ConfirmVetVars extends ConfirmVetPayload {
  caseId: string;
}

export function useConfirmVet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ caseId, ...payload }: ConfirmVetVars) =>
      DeathCaseAPI.confirmVet(caseId, payload),
    onSuccess: (_, { caseId }) => {
      queryClient.invalidateQueries({ queryKey: ["death-case", caseId] });
      queryClient.invalidateQueries({ queryKey: ["death-cases"] });
    },
    onError: (error) => {
      toast.error("Failed to save changes", {
        description: getErrorMessage(error),
      });
    },
  });
}

// ─── Record disposal ──────────────────────────────────────────────────────────

interface RecordDisposalVars extends RecordDisposalPayload {
  caseId: string;
}

export function useRecordDisposal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ caseId, ...payload }: RecordDisposalVars) =>
      DeathCaseAPI.recordDisposal(caseId, payload),
    onSuccess: (_, { caseId }) => {
      queryClient.invalidateQueries({ queryKey: ["death-case", caseId] });
      queryClient.invalidateQueries({ queryKey: ["death-cases"] });
    },
    onError: (error) => {
      toast.error("Failed to save changes", {
        description: getErrorMessage(error),
      });
    },
  });
}

// ─── Manager review ───────────────────────────────────────────────────────────

interface ManagerReviewVars extends ManagerReviewPayload {
  caseId: string;
}

export function useManagerReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ caseId, ...payload }: ManagerReviewVars) =>
      DeathCaseAPI.managerReview(caseId, payload),
    onSuccess: (_, { caseId }) => {
      queryClient.invalidateQueries({ queryKey: ["death-case", caseId] });
      queryClient.invalidateQueries({ queryKey: ["death-cases"] });
    },
    onError: (error) => {
      toast.error("Could not update case status", {
        description: getErrorMessage(error),
      });
    },
  });
}
