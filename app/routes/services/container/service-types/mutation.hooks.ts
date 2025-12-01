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
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast.success("Tạo loại dịch vụ thành công");
    },
  });
}

export function useUpdateServiceType(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ data }: { data: UpdateServiceTypeRequestDto }) =>
      await ServiceTypesService.updateServiceType(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-types"] });
      queryClient.invalidateQueries({ queryKey: ["service-types-detail", id] });
      toast.success("Cập nhật loại dịch vụ thành công");
    },
  });
}

export function useDeleteServiceType(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => await ServiceTypesService.deleteServiceType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-types"] });
      queryClient.invalidateQueries({ queryKey: ["service-types-detail", id] });
      toast.success("Xóa loại dịch vụ thành công");
    },
  });
}
