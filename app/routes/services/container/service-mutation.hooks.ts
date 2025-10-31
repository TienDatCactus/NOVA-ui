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
      queryClient.refetchQueries({ queryKey: ["services"] });
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
      queryClient.refetchQueries({ queryKey: ["services"] });
    },
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => await ServicesService.deleteService(id),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ["services"] });
    },
  });
}
