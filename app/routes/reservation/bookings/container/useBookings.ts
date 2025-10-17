import { useQuery } from "@tanstack/react-query";
import { BookingService } from "~/services/api/booking";
import type { BookingListParams } from "~/services/types/booking.types";
function useBookings(params?: BookingListParams) {
  return useQuery({
    queryKey: ["bookings", params],
    queryFn: () => BookingService.getBookingList({ date: params?.date }),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export default useBookings;
