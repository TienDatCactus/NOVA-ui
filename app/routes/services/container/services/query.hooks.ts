import { useQuery } from "@tanstack/react-query";
import { ServicesService } from "~/services/api/services";
import type { ServiceListParams } from "~/services/types/service.types";

export function useServices(params?: ServiceListParams) {
  return useQuery({
    queryKey: ["services", params],
    queryFn: async () => await ServicesService.getServiceList(params || {}),
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
