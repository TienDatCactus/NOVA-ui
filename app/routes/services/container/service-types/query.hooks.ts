import { useQuery } from "@tanstack/react-query";
import { ServiceTypesService } from "~/services/api/service-types";
import type { ServiceTypeListParams } from "~/services/api/service-types/service-types.types";

export function useServiceTypes(params?: ServiceTypeListParams) {
  return useQuery({
    queryKey: ["service-types", params],
    queryFn: async () =>
      await ServiceTypesService.getServiceTypeList(params || {}),
  });
}

export function useServiceTypeDetails(
  id: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["service-types-detail", id],
    queryFn: async () => await ServiceTypesService.getServiceTypeDetail(id),
    enabled: options?.enabled ?? !!id,
  });
}
