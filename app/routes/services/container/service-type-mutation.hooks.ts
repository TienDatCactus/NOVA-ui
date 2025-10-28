import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ServiceTypesService } from "~/services/api/service-types";
import type {
  CreateServiceTypeRequestDto,
  UpdateServiceTypeRequestDto,
} from "~/services/api/service-types/dto";

export function useCreateServiceType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateServiceTypeRequestDto) =>
      await ServiceTypesService.createServiceType(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-types"] });
      queryClient.invalidateQueries({ queryKey: ["services"] }); // Refresh services too
      toast.success("Thêm loại dịch vụ thành công");
    },
    onError: () => {
      toast.error("Có lỗi xảy ra khi thêm loại dịch vụ");
    },
  });
}

export function useUpdateServiceType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateServiceTypeRequestDto;
    }) => await ServiceTypesService.updateServiceType(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-types"] });
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast.success("Cập nhật loại dịch vụ thành công");
    },
    onError: () => {
      toast.error("Có lỗi xảy ra khi cập nhật loại dịch vụ");
    },
  });
}

export function useDeleteServiceType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) =>
      await ServiceTypesService.deleteServiceType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-types"] });
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast.success("Xóa loại dịch vụ thành công");
    },
    onError: () => {
      toast.error("Có lỗi xảy ra khi xóa loại dịch vụ");
    },
  });
}
