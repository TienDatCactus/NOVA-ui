import { useQuery } from "@tanstack/react-query";
import { ServicesService } from "~/services/api/services";
import type { ServiceListParams } from "~/services/api/services/service.types";

export function useServices(params?: ServiceListParams) {
  return useQuery({
    queryKey: ["services", params],
    queryFn: async () => await ServicesService.getServiceList(params || {}),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
}

export function useServiceDetail(
  serviceId: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["service-detail", serviceId],
    queryFn: async () => await ServicesService.getServiceDetail(serviceId),
    enabled: options?.enabled ?? !!serviceId,
  });
}
