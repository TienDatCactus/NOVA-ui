import { useQuery } from "@tanstack/react-query";
import { BookingService } from "~/services/api/booking";

export function useOTAInfo({ selection }: { selection: boolean }) {
  return useQuery({
    queryKey: ["ota-info"],
    queryFn: async () => await BookingService.getBookingOTA(),
    staleTime: 5 * 60 * 1000,
    enabled: selection,
  });
}
