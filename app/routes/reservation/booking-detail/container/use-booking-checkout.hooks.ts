import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BookingService } from "~/services/api/booking";
import type {
  ConfirmBookingPaymentRequestDto,
  StaffAddCompletedChargesRequestDto,
  StaffCheckoutPaymentRequestDto,
  StaffCheckoutRequestDto,
} from "~/services/api/booking/dto";

/**
 * Hook to fetch pending charges for a booking
 */
export function useBookingPendingCharges(bookingId: string, enabled = true) {
  return useQuery({
    queryKey: ["checkout", "pending-charges", bookingId],
    queryFn: () => BookingService.getBookingPendingCharges(bookingId),
    enabled: enabled && !!bookingId,
    staleTime: 0, // Always fetch fresh data
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

/**
 * Hook to create checkout invoice (consolidated)
 */
export function useCreateCheckoutInvoice(bookingId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => BookingService.staffCreateCheckoutInvoice(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["checkout", "pending-charges", bookingId],
      });
    },
  });
}

/**
 * Hook to process checkout payment
 */
export function useCheckoutPayment(bookingId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StaffCheckoutPaymentRequestDto) =>
      BookingService.staffCheckoutPayment(bookingId, data),
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({
        queryKey: ["checkout", "pending-charges", bookingId],
      });
      queryClient.invalidateQueries({
        queryKey: ["bookings", "detail"],
      });
    },
    onError: (error: any) => {
      console.error("Checkout payment failed:", error);
      toast.error("Thanh toán thất bại. Điều chỉnh số tiền và thử lại.");
    },
  });
}

/**
 * Hook to finalize checkout
 */
export function useCheckout(bookingId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StaffCheckoutRequestDto) =>
      BookingService.staffCheckout(bookingId, data),
    onSuccess: () => {
      // Invalidate all booking-related queries
      queryClient.invalidateQueries({
        queryKey: ["bookings"],
      });
    },
    onError: (error: any) => {
      console.error("Checkout failed:", error);
      toast.error(error?.message || "Checkout thất bại. Vui lòng thử lại.");
    },
  });
}

export function useConfirmBookingPayment(bookingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ConfirmBookingPaymentRequestDto) =>
      BookingService.staffConfirmBookingPayment(bookingId || "", data),
    onSuccess: (response) => {
      toast.success(response.message || "Xác nhận thanh toán thành công");
      queryClient.invalidateQueries({
        queryKey: ["booking-detail", bookingId],
      });
      queryClient.invalidateQueries({
        queryKey: ["invoices", "booking", bookingId],
      });
    },
  });
}

export function useAddCompletedCharges(bookingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: StaffAddCompletedChargesRequestDto) =>
      await BookingService.staffAddCompletedCharges(bookingId, data),
    onSuccess: () => {
      toast.success("Đã thêm completed charges thành công");
      queryClient.invalidateQueries({
        queryKey: ["booking-pending-charges", bookingId],
      });
      queryClient.invalidateQueries({
        queryKey: ["checkout", "pending-charges", bookingId],
      });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Lỗi khi thêm completed charges");
    },
  });
}
