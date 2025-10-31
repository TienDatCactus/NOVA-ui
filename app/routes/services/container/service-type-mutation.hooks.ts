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
      queryClient.refetchQueries({ queryKey: ["service-types"] });
      queryClient.refetchQueries({ queryKey: ["services"] });
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
      queryClient.refetchQueries({ queryKey: ["service-types"] });
      queryClient.refetchQueries({ queryKey: ["services"] });
    },
  });
}

export function useDeleteServiceType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) =>
      await ServiceTypesService.deleteServiceType(id),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ["service-types"] });
      queryClient.refetchQueries({ queryKey: ["services"] });
    },
  });
}
