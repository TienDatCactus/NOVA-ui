import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { UnitsService } from "~/services/api/units";
import type {
  CreateUnitRequestDto,
  UpdateUnitRequestDto,
} from "~/services/api/units/dto";

export function useCreateUnit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateUnitRequestDto) =>
      await UnitsService.createUnit(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["units"] });
      toast.success("Tạo đơn vị thành công");
    },
  });
}

export function useUpdateUnit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateUnitRequestDto;
    }) => await UnitsService.updateUnit(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["units"] });
      toast.success("Cập nhật đơn vị thành công");
    },
  });
}

export function useDeleteUnit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => await UnitsService.deleteUnit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["units"] });
      toast.success("Xóa đơn vị thành công");
    },
  });
}
