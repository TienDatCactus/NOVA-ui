import { useQuery } from "@tanstack/react-query";
import { ServiceTypesService } from "~/services/api/service-types";
import { UnitsService } from "~/services/api/units";
import { ServicesService } from "~/services/api/services";

export function useServiceTypes() {
  return useQuery({
    queryKey: ["service-types"],
    queryFn: () => ServiceTypesService.getServiceTypesList(),
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useUnits() {
  return useQuery({
    queryKey: ["units"],
    queryFn: () => UnitsService.getUnitsList(),
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useServicesByType(serviceTypeId: string | null) {
  return useQuery({
    queryKey: ["services-by-type", serviceTypeId],
    queryFn: () => ServicesService.getServicesByType(serviceTypeId!),
    enabled: !!serviceTypeId && serviceTypeId !== "all",
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
