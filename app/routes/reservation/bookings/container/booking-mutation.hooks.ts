import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BookingService } from "~/services/api/booking";
import type {
  StaffUpdateBookingRequestDto,
  StaffChangeRoomRequestDto,
} from "~/services/api/booking/dto";

function useUpdateBooking(bookingId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: StaffUpdateBookingRequestDto) =>
      await BookingService.staffUpdateBookingDetail(bookingId, data),
    onSuccess: (response) => {
      // Don't toast here - let the component handle success message
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["bookings-detail"] });
    },
  });
}

function useChangeRoom(bookingId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: StaffChangeRoomRequestDto) =>
      await BookingService.staffChangeRoom(bookingId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["bookings-detail"] });
      queryClient.invalidateQueries({
        queryKey: ["available-rooms-for-change"],
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
    },
  });
}

export { useCancelBooking, useUpdateBooking, useChangeRoom };
