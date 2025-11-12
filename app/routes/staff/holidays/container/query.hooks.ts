import { useQuery } from "@tanstack/react-query";
import { HolidayService } from "~/services/api/holiday";

export function useHolidayList() {
  return useQuery({
    queryKey: ["holidays"],
    queryFn: async () => await HolidayService.getHolidayList(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
}
