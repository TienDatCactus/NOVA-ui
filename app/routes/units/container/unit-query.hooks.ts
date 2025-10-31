import { useQuery } from "@tanstack/react-query";
import { UnitsService } from "~/services/api/units";

export function useUnits() {
  return useQuery({
    queryKey: ["units"],
    queryFn: async () => await UnitsService.getUnitList(),
    staleTime: 10 * 60 * 1000,
  });
}
