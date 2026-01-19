import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import type z from "zod";
import { BookingService } from "~/services/api/booking";
import type { BookingSchema } from "~/services/api/booking/booking.schema";
import type {
  ChangeRoomTypeRequestDto,
  CheckinBookingRequestDto,
  PreAssignRoomsRequestDto,
  StaffChangeRoomRequestDto,
  StaffUpdateBookingRequestDto,
} from "~/services/api/booking/dto";

function useUpdateBooking(bookingId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: StaffUpdateBookingRequestDto) =>
      await BookingService.staffUpdateBookingDetail(bookingId, data),
    onSuccess: async (_) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["bookings-detail"],
          exact: false,
        }),
        queryClient.invalidateQueries({
          queryKey: ["bookings"],
          exact: false,
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
        queryClient.invalidateQueries({
          queryKey: ["checkout", "pending-charges", bookingId],
        }),
      ]);

      toast.success("Cập nhật đặt phòng thành công");
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        toast.error(
          error.response?.data.message || "Cập nhật đặt phòng thất bại",
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
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["bookings-detail"],
          exact: false,
        }),
        queryClient.invalidateQueries({
          queryKey: ["bookings"],
          exact: false,
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
        queryClient.invalidateQueries({
          queryKey: ["checkout", "pending-charges", bookingId],
        }),
      ]);
      toast.success("Đổi phòng thành công");
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
    onSuccess: async (_) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["bookings-detail"],
          exact: false,
        }),
        queryClient.invalidateQueries({
          queryKey: ["bookings"],
          exact: false,
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
        queryClient.invalidateQueries({
          queryKey: ["checkout", "pending-charges", bookingId],
        }),
      ]);
      toast.success("Hủy đặt phòng thành công");
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
      status: z.infer<typeof BookingSchema.BookingStatusEnum>,
    ) => {
      return await BookingService.updateBookingStatus({
        bookingId: bookingId,
        newStatus: status,
      });
    },
    onSuccess: async () => {
      // Invalidate all related queries
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["bookings-detail"],
          exact: false,
        }),
        queryClient.invalidateQueries({
          queryKey: ["bookings"],
          exact: false,
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
        queryClient.invalidateQueries({
          queryKey: ["checkout", "pending-charges", bookingId],
        }),
      ]);
      toast.success("Cập nhật trạng thái thành công");
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        toast.error(
          error.response?.data.message || "Cập nhật trạng thái thất bại",
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
          error.response?.data.message || "Xuất báo cáo đặt phòng thất bại",
        );
      }
    },
  });
}

function useCheckinBooking(bookingId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CheckinBookingRequestDto) =>
      await BookingService.checkinBooking(bookingId, data),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["bookings-detail"],
          exact: false,
        }),
        queryClient.invalidateQueries({
          queryKey: ["bookings"],
          exact: false,
        }),
        queryClient.invalidateQueries({
          queryKey: ["bookings-rooms-week"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["orderable-bookings"],
        }),
      ]);
      toast.success("Checkin thành công");
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message || "Checkin thất bại");
      }
    },
  });
}

function usePreAssignRooms(bookingId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: PreAssignRoomsRequestDto) =>
      await BookingService.preAssignRooms(bookingId, data),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["bookings-detail"],
          exact: false,
        }),
        queryClient.invalidateQueries({
          queryKey: ["bookings"],
          exact: false,
        }),
        queryClient.invalidateQueries({
          queryKey: ["bookings-rooms-week"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["orderable-bookings"],
        }),
      ]);
      toast.success("Gán phòng thành công");
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message || "Gán phòng thất bại");
      }
    },
  });
}

function useChangeRoomType(bookingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: ChangeRoomTypeRequestDto) =>
      await BookingService.changeRoomType(bookingId, data),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["bookings-detail"],
          exact: false,
        }),
        queryClient.invalidateQueries({
          queryKey: ["bookings"],
          exact: false,
        }),
        queryClient.invalidateQueries({
          queryKey: ["bookings-rooms-week"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["orderable-bookings"],
        }),
      ]);
      toast.success("Gán phòng thành công");
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message || "Gán phòng thất bại");
      }
    },
  });
}

export {
  useCancelBooking,
  useChangeRoom,
  useCheckinBooking,
  useExportBookings,
  useUpdateBooking,
  useUpdateBookingStatus,
  usePreAssignRooms,
  useChangeRoomType,
};
