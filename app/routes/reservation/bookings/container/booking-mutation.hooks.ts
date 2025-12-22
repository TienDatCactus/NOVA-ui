import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import type z from "zod";
import { BookingService } from "~/services/api/booking";
import type { BookingSchema } from "~/services/api/booking/booking.schema";
import type {
  StaffChangeRoomRequestDto,
  StaffUpdateBookingRequestDto,
} from "~/services/api/booking/dto";

function useUpdateBooking(bookingId: string, bookingCode?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: StaffUpdateBookingRequestDto) =>
      await BookingService.staffUpdateBookingDetail(bookingId, data),
    onSuccess: async (response) => {
      if (bookingCode) {
        queryClient.invalidateQueries({
          queryKey: ["bookings-detail", bookingCode, response.bookingId],
        });
      }
      queryClient.invalidateQueries({
        queryKey: ["bookings"],
      });
      queryClient.invalidateQueries({
        queryKey: ["bookings-detail", response.bookingId],
      });
      queryClient.invalidateQueries({
        queryKey: ["bookings-rooms-week"],
      });
      queryClient.invalidateQueries({
        queryKey: ["orderable-bookings"],
      });
      queryClient.invalidateQueries({
        queryKey: ["available-rooms"],
      });

      toast.success("Cập nhật đặt phòng thành công");
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
          queryKey: ["bookings-detail", bookingId],
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
        toast.error(error.response?.data.message || "Đổi phòng thất bại");
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
          queryKey: ["bookings-detail", data.bookingId, data.bookingCode],
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
        toast.error(error.response?.data.message || "Hủy đặt phòng thất bại");
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
        queryKey: ["bookings-detail", bookingId],
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

function useExportBookings(date?: string) {
  return useMutation({
    mutationFn: async () => await BookingService.exportBookings(date),
    onError: (error) => {
      if (error instanceof AxiosError) {
        toast.error(
          error.response?.data.message || "Xuất báo cáo đặt phòng thất bại"
        );
      }
    },
  });
}
export {
  useCancelBooking,
  useChangeRoom,
  useExportBookings,
  useUpdateBooking,
  useUpdateBookingStatus,
};
