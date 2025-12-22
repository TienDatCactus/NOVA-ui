import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { ConfigService } from "~/services/api/configs";
import type { UpdateConfigRequest } from "~/services/api/configs/dto";

export function useGroupedConfigs() {
  return useQuery({
    queryKey: ["configs", "grouped"],
    queryFn: async () => await ConfigService.getGroupedConfigList(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
}

/**
 * Hook: useTimezones
 * Fetches available timezones for timezone config fields
 */
export function useTimezones() {
  return useQuery({
    queryKey: ["configs", "timezones"],
    queryFn: async () => await ConfigService.getTimezones(),
    staleTime: 60 * 60 * 1000, // 1 hour (rarely changes)
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

export function useConfigDetail(key: string | null) {
  return useQuery({
    queryKey: ["configs", key],
    queryFn: async () => {
      if (!key) throw new Error("Config key is required");
      return await ConfigService.getConfigDetail(key);
    },
    enabled: !!key,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook: useUpdateConfig
 * Mutation to update a config value
 */
export function useUpdateConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      key,
      data,
    }: {
      key: string;
      data: UpdateConfigRequest;
    }) => {
      return await ConfigService.updateConfig(key, data);
    },
    onSuccess: (_, variables) => {
      toast.success("Cập nhật cấu hình thành công");
      // Invalidate both grouped list and detail queries
      queryClient.invalidateQueries({ queryKey: ["configs", "grouped"] });
      queryClient.invalidateQueries({ queryKey: ["configs", variables.key] });
    },
    onError: (error) => {
      if (error instanceof AxiosError)
        toast.error(
          error.response?.data.message || "Cập nhật cấu hình thất bại"
        );
    },
  });
}

/**
 * Hook: useDeleteConfig (Reset to default)
 * Mutation to delete/reset a config to system default
 */
export function useDeleteConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (key: string) => {
      return await ConfigService.deleteConfig(key);
    },
    onSuccess: () => {
      toast.success("Đã đặt lại cấu hình về mặc định");
      // Invalidate grouped list to refresh display
      queryClient.invalidateQueries({ queryKey: ["configs", "grouped"] });
    },
    onError: (error) => {
      if (error instanceof AxiosError)
        toast.error(
          error.response?.data.message || "Đặt lại cấu hình thất bại"
        );
    },
  });
}
