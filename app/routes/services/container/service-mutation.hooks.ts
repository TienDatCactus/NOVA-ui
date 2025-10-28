import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ServicesService } from "~/services/api/services";
import type {
  CreateServiceRequestDto,
  UpdateServiceRequestDto,
} from "~/services/api/services/dto";

export function useCreateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateServiceRequestDto) =>
      await ServicesService.createService(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast.success("Thêm dịch vụ thành công");
    },
    onError: () => {
      toast.error("Có lỗi xảy ra khi thêm dịch vụ");
    },
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateServiceRequestDto;
    }) => await ServicesService.updateService(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast.success("Cập nhật dịch vụ thành công");
    },
    onError: () => {
      toast.error("Có lỗi xảy ra khi cập nhật dịch vụ");
    },
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => await ServicesService.deleteService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast.success("Xóa dịch vụ thành công");
    },
    onError: () => {
      toast.error("Có lỗi xảy ra khi xóa dịch vụ");
    },
  });
}
