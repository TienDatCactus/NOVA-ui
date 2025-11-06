import { useQuery } from "@tanstack/react-query";
import { UnitsService } from "~/services/api/units";
import type { UnitListParams } from "~/services/types/unit.types";

export function useUnits(params: UnitListParams = { includeInactive: true }) {
  return useQuery({
    queryKey: ["units", params],
    queryFn: async () => await UnitsService.getUnitList(params),
    staleTime: 10 * 60 * 1000,
  });
}
