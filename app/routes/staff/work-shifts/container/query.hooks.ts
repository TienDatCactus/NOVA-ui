import { useQuery } from "@tanstack/react-query";
import { WorkShiftService } from "~/services/api/work-shift";

export function useWorkShiftList() {
  return useQuery({
    queryKey: ["work-shifts"],
    queryFn: async () => await WorkShiftService.getWorkShiftList(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
}
