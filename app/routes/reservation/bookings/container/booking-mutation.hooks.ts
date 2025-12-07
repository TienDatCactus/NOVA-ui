import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import type z from "zod";
import { BookingService } from "~/services/api/booking";
import type { BookingSchema } from "~/services/api/booking/booking.schema";
import { BOOKING_STATUSES } from "~/services/api/booking/booking.types";
import type {
  StaffUpdateBookingRequestDto,
  StaffChangeRoomRequestDto,
} from "~/services/api/booking/dto";

function useUpdateBooking(bookingId: string, bookingCode?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: StaffUpdateBookingRequestDto) =>
      await BookingService.staffUpdateBookingDetail(bookingId, data),
    onSuccess: async (response) => {
      if (bookingCode) {
        queryClient.setQueryData(
          ["bookings-detail", bookingCode, response.bookingId],
          response
        );
      }
      (queryClient.invalidateQueries({
        queryKey: ["bookings"],
      }),
        queryClient.invalidateQueries({
          queryKey: ["bookings-detail"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["available-rooms"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["bookings-rooms-week"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["orderable-bookings"],
        }),
        toast.success("Cập nhật đặt phòng thành công"));
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        toast.error(
          error.response?.data.message || "Cập nhật đặt phòng thất bại"
        );
      }
    },
  });
}

function useChangeRoom(bookingId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: StaffChangeRoomRequestDto) =>
      await BookingService.staffChangeRoom(bookingId, data),
    onSuccess: async () => {
      (queryClient.invalidateQueries({
        queryKey: ["bookings"],
      }),
        queryClient.invalidateQueries({
          queryKey: ["bookings-detail"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["available-rooms-for-change"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["available-rooms"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["bookings-rooms-week"],
        }),
        toast.success("Đổi phòng thành công"));
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        toast.error(
          error.response?.data.message || "Cập nhật trạng thái thất bại"
        );
      }
    },
  });
}

function useCancelBooking(bookingId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return await BookingService.staffCancelBooking(bookingId);
    },
    onSuccess: async (data) => {
      (queryClient.invalidateQueries({
        queryKey: ["bookings"],
      }),
        queryClient.invalidateQueries({
          queryKey: ["bookings-detail"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["bookings-rooms-week"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["orderable-bookings"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["available-rooms"],
        }),
        toast.success("Hủy đặt phòng thành công"));
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        toast.error(
          error.response?.data.message || "Cập nhật trạng thái thất bại"
        );
      }
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
    onSuccess: async () => {
      // Invalidate all related queries
      (queryClient.invalidateQueries({
        queryKey: ["bookings-detail"],
      }),
        queryClient.invalidateQueries({
          queryKey: ["bookings"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["bookings-rooms-week"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["orderable-bookings"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["available-rooms"],
        }),
        toast.success("Cập nhật trạng thái thành công"));
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        toast.error(
          error.response?.data.message || "Cập nhật trạng thái thất bại"
        );
      }
    },
  });
}
export {
  useCancelBooking,
  useUpdateBooking,
  useChangeRoom,
  useUpdateBookingStatus,
};
