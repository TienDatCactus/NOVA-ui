import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type z from "zod";
import { BookingService } from "~/services/api/booking";
import type { BookingSchema } from "~/services/api/booking/booking.schema";
import { BOOKING_STATUSES } from "~/services/api/booking/booking.types";
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
      queryClient.invalidateQueries({
        queryKey: ["bookings"],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["bookings-detail"],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["available-rooms"],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["orderable-bookings"],
        refetchType: "active",
      });
    },
  });
}

function useChangeRoom(bookingId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: StaffChangeRoomRequestDto) =>
      await BookingService.staffChangeRoom(bookingId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["bookings"],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["bookings-detail"],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["available-rooms-for-change"],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["available-rooms"],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["bookings-rooms-week"],
        refetchType: "active",
      });
    },
  });
}

function useCancelBooking(bookingId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return await BookingService.staffCancelBooking(bookingId);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["bookings"],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["bookings-detail"],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["bookings-rooms-week"],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["orderable-bookings"],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["available-rooms"],
        refetchType: "active",
      });
    },
  });
}

function useUpdateBookingStatus(bookingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      status: z.infer<typeof BookingSchema.BookingStatusEnum>
    ) => {
      return await BookingService.updateBookingStatus({
        bookingId: bookingId,
        newStatus: status,
      });
    },
    onSuccess: () => {
      toast.success("Cập nhật trạng thái thành công");

      queryClient.invalidateQueries({
        queryKey: ["bookings-detail"],
        refetchType: "active",
      });

      queryClient.invalidateQueries({
        queryKey: ["bookings"],
        refetchType: "active",
      });

      queryClient.invalidateQueries({
        queryKey: ["bookings-rooms-week"],
        refetchType: "active",
      });

      queryClient.invalidateQueries({
        queryKey: ["orderable-bookings"],
        refetchType: "active",
      });

      queryClient.invalidateQueries({
        queryKey: ["available-rooms"],
        refetchType: "active",
      });
    },
  });
}
export {
  useCancelBooking,
  useUpdateBooking,
  useChangeRoom,
  useUpdateBookingStatus,
};
