// useBookingDetail.ts
import { useQuery } from "@tanstack/react-query";
import { BookingService } from "~/services/api/booking";
import type { BookingListParams } from "~/services/types/booking.types";

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

function useBookings(params?: BookingListParams) {
  return useQuery({
    queryKey: ["bookings", params],
    queryFn: async () => await BookingService.getBookingList(params || {}),
    staleTime: 5 * 60 * 1000,
  });
}

export { useBookingDetail, useBookingRoomsWeek, useBookings };
