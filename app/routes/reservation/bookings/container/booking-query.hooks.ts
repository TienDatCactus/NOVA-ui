// useBookingDetail.ts
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { BookingService } from "~/services/api/booking";
import type { BookingListParams } from "~/services/api/booking/booking.types";
import { RoomsService } from "~/services/api/rooms";
import type { GetAvailableRoomsInternalParams } from "~/services/api/rooms/room.types";

function useBookingDetail({
  bookingCode,
  bookingId,
  enabled = true,
}: {
  bookingCode?: string;
  bookingId?: string;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: [
      "bookings-detail",
      bookingCode && bookingCode,
      bookingId && bookingId,
    ],
    queryFn: async () =>
      await BookingService.getBookingDetail({
        code: bookingCode,
        id: bookingId,
      }),
    enabled: enabled && (!!bookingCode || !!bookingId),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: true,
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
    refetchOnMount: true,
  });
}

function useBookings(params?: BookingListParams) {
  return useQuery({
    queryKey: ["bookings", params],
    queryFn: async () => await BookingService.getBookingList(params || {}),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: true,
  });
}

function useAvailableRooms({
  checkinDate,
  checkoutDate,
  guests = 1,
  enabled = false,
}: {
  checkinDate: Date | string;
  checkoutDate: Date | string;
  guests?: number;
  enabled?: boolean;
}) {
  const params: GetAvailableRoomsInternalParams = {
    CheckInDate:
      checkinDate instanceof Date
        ? format(checkinDate, "yyyy-MM-dd")
        : checkinDate,
    CheckOutDate:
      checkoutDate instanceof Date
        ? format(checkoutDate, "yyyy-MM-dd")
        : checkoutDate,
    Guests: guests,
  };

  return useQuery({
    queryKey: ["available-rooms", params],
    queryFn: async () => await RoomsService.getAvailableRoomsInternal(params),
    staleTime: 2 * 60 * 1000,
    enabled: enabled,
  });
}

function useAvailableRoomsForChange({
  bookingId,
  bookingRoomId,
  enabled = false,
}: {
  bookingId: string;
  bookingRoomId: string;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: ["available-rooms-for-change", bookingId, bookingRoomId],
    queryFn: async () =>
      await BookingService.getAvailableRoomsForChange(bookingId, bookingRoomId),
    staleTime: 2 * 60 * 1000,
    enabled: enabled && !!bookingId,
  });
}

function useOrderableBookings() {
  return useQuery({
    queryKey: ["orderable-bookings"],
    queryFn: async () => await BookingService.getOrderableBookings(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: true,
  });
}

export {
  useAvailableRooms,
  useAvailableRoomsForChange,
  useBookingDetail,
  useBookingRoomsWeek,
  useBookings,
  useOrderableBookings,
};
