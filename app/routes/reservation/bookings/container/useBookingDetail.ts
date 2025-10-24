// useBookingDetail.ts
import { useQuery } from "@tanstack/react-query";
import { BookingService } from "~/services/api/booking";

interface UseBookingDetailProps {
  bookingCode?: string;
  bookingId?: string;
  enabled?: boolean;
}

function useBookingDetail({
  bookingCode,
  bookingId,
  enabled = true,
}: UseBookingDetailProps) {
  return useQuery({
    queryKey: ["bookings-detail", bookingCode, bookingId],
    queryFn: async () =>
      await BookingService.getBookingDetail({
        code: bookingCode,
        id: bookingId,
      }),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    enabled: enabled && (!!bookingCode || !!bookingId),
  });
}

export default useBookingDetail;
