import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BookingService } from "~/services/api/booking";
import type { StaffUpdateBookingRequestDto } from "~/services/api/booking/dto";

function useUpdateBooking(bookingId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: StaffUpdateBookingRequestDto) =>
      await BookingService.staffUpdateBookingDetail(bookingId, data),
    onSuccess: (response) => {
      toast.success("Cập nhật đặt phòng thành công");
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({
        queryKey: ["booking-detail", bookingId],
      });
      queryClient.invalidateQueries({
        queryKey: ["booking-detail", response.bookingCode],
      });
    },
  });
}

function useChangeRoom(bookingId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      rooms: Array<{ bookingRoomId: string; newRoomId: string }>;
    }) => await BookingService.staffUpdateBookingDetail(bookingId, data as any),
    onSuccess: (response) => {
      toast.success("Đổi phòng thành công");
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({
        queryKey: ["booking-detail", bookingId],
      });
      queryClient.invalidateQueries({
        queryKey: ["booking-detail", response.bookingCode],
      });
    },
  });
}

function useCancelBooking(bookingId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return await BookingService.staffCancelBooking(id);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      if (bookingId) {
        queryClient.invalidateQueries({
          queryKey: ["booking-detail", bookingId],
        });
      }
      if (data.bookingCode) {
        queryClient.invalidateQueries({
          queryKey: ["booking-detail", data.bookingCode],
        });
      }
    },
  });
}

export { useCancelBooking, useUpdateBooking, useChangeRoom };
