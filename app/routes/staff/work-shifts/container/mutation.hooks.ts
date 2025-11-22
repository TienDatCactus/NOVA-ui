import { QueryClient, useMutation } from "@tanstack/react-query";
import { WorkShiftService } from "~/services/api/staff/work-shift";
import type {
  CreateWorkShiftRequest,
  UpdateWorkShiftRequest,
} from "~/services/api/staff/work-shift/dto";

export function useCreateWorkShift() {
  const qc = new QueryClient();
  return useMutation({
    mutationKey: ["create-work-shift"],
    mutationFn: async (data: CreateWorkShiftRequest) => {
      await WorkShiftService.createWorkShift(data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["work-shifts"] });
    },
  });
}

export function useDeleteWorkShift() {
  const qc = new QueryClient();
  return useMutation({
    mutationKey: ["delete-work-shift"],
    mutationFn: async (id: string) => {
      await WorkShiftService.deleteWorkShift(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["work-shifts"] });
    },
  });
}

export function useUpdateWorkShift() {
  const qc = new QueryClient();
  return useMutation({
    mutationKey: ["update-work-shift"],
    mutationFn: async (data: {
      id: string;
      payload: UpdateWorkShiftRequest;
    }) => {
      await WorkShiftService.updateWorkShift(data.id, data.payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["work-shifts"] });
    },
  });
}
