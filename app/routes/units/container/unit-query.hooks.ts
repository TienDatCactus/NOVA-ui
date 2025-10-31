import { useQuery } from "@tanstack/react-query";
import { UnitsService } from "~/services/api/units";

export function useUnits() {
  return useQuery({
    queryKey: ["units", { includeInactive: true }],
    queryFn: async () =>
      await UnitsService.getUnitList({ includeInactive: true }),
    staleTime: 10 * 60 * 1000,
  });
}
