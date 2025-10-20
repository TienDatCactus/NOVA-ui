import { useQuery } from "@tanstack/react-query";
import { BookingService } from "~/services/api/booking";
import type { BookingListParams } from "~/services/types/booking.types";
function useBookingRoomsWeek(params?: BookingListParams) {
  return useQuery({
    queryKey: ["bookings-rooms-week", params],
    queryFn: async () =>
      await BookingService.getBookingListByWeek({
        weekStart: params?.weekStart,
      }),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
}

export default useBookingRoomsWeek;
