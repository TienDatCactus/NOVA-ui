import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { WorkShiftService } from "~/services/api/work-shift";
import type {
  CreateWorkShiftRequest,
  UpdateWorkShiftRequest,
} from "~/services/api/work-shift/dto";

export function useCreateWorkShift() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["create-work-shift"],
    mutationFn: async (data: CreateWorkShiftRequest) => {
      await WorkShiftService.createWorkShift(data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["work-shifts"] });
      toast.success("Tạo ca làm việc thành công");
    },
  });
}

export function useDeleteWorkShift() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["delete-work-shift"],
    mutationFn: async (id: string) => {
      await WorkShiftService.deleteWorkShift(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["work-shifts"] });
      toast.success("Xóa ca làm việc thành công");
    },
  });
}

export function useUpdateWorkShift() {
  const qc = useQueryClient();
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
      toast.success("Cập nhật ca làm việc thành công");
    },
  });
}
