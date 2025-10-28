import { useQuery } from "@tanstack/react-query";
import { ServiceTypesService } from "~/services/api/service-types";
import type { ServiceTypeListParams } from "~/services/types/service-types.types";

export function useServiceTypes(params?: ServiceTypeListParams) {
  return useQuery({
    queryKey: ["service-types", params],
    queryFn: async () =>
      await ServiceTypesService.getServiceTypeList(params || {}),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
}
