import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BookingService } from "~/services/api/booking";
import type {
  ConfirmBookingPaymentRequestDto,
  StaffAddCompletedChargesRequestDto,
  StaffCheckoutPaymentRequestDto,
  StaffCheckoutRequestDto,
} from "~/services/api/booking/dto";
import { InvoicesService } from "~/services/api/invoices";
import type {
  InvoicePreviewRequestDto,
  InvoiceCalculateFeesRequestDto,
  UpdateInvoiceRequestDto,
} from "~/services/api/invoices/dto";

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
 * Hook to preview booking invoice before creation
 */
export function useInvoicePreview(
  data: InvoicePreviewRequestDto,
  enabled = false
) {
  return useQuery({
    queryKey: ["invoice-preview", data],
    queryFn: () => InvoicesService.previewBookingInvoice(data),
    enabled:
      enabled &&
      (data.posOrderIds.length > 0 || data.serviceOrderIds.length > 0),
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to calculate invoice fees with VAT/Service Charge toggles
 */
export function useCalculateInvoiceFees(
  data: InvoiceCalculateFeesRequestDto,
  enabled = false
) {
  return useQuery({
    queryKey: ["calculate-fees", data],
    queryFn: () => InvoicesService.calculateInvoiceFees(data),
    enabled: enabled && data.subtotalAmount > 0,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to fetch invoice detail by ID
 */
export function useInvoiceDetail(invoiceId: string, enabled = true) {
  return useQuery({
    queryKey: ["invoice-detail", invoiceId],
    queryFn: () => InvoicesService.getInvoiceDetail(invoiceId),
    enabled: enabled && !!invoiceId,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to fetch invoices by booking ID
 */
export function useInvoicesByBooking(bookingId: string, enabled = true) {
  return useQuery({
    queryKey: ["invoices-by-booking", bookingId],
    queryFn: () => InvoicesService.getInvoicesByBooking(bookingId),
    enabled: enabled && !!bookingId,
    staleTime: 0,
    refetchOnWindowFocus: false,
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
      queryClient.invalidateQueries({
        queryKey: ["booking-invoices"],
      });
      queryClient.invalidateQueries({
        queryKey: ["bookings-detail"],
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
        queryKey: ["bookings-detail"],
      });
      queryClient.invalidateQueries({
        queryKey: ["invoices-by-booking", bookingId],
      });
      queryClient.invalidateQueries({
        queryKey: ["invoice-detail"],
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
      queryClient.invalidateQueries({
        queryKey: ["bookings"],
      });
      queryClient.invalidateQueries({
        queryKey: ["bookings-detail"],
      });
      queryClient.invalidateQueries({
        queryKey: ["invoices-by-booking", bookingId],
      });
    },
  });
}

/**
 * Hook to update invoice fees
 */
export function useUpdateInvoice(invoiceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateInvoiceRequestDto) =>
      InvoicesService.updateInvoice(invoiceId, data),
    onSuccess: () => {
      toast.success("Cập nhật invoice thành công");
      queryClient.invalidateQueries({
        queryKey: ["invoice-detail", invoiceId],
      });
      queryClient.invalidateQueries({
        queryKey: ["bookings-detail"],
      });
      queryClient.invalidateQueries({
        queryKey: ["invoices-by-booking"],
      });
    },
    onError: (error: any) => {
      console.error("Update invoice failed:", error);
      toast.error(
        error?.message || "Cập nhật invoice thất bại. Vui lòng thử lại."
      );
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
        queryKey: ["bookings-detail"],
      });
      queryClient.invalidateQueries({
        queryKey: ["invoices-by-booking", bookingId],
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
      queryClient.invalidateQueries({
        queryKey: ["bookings-detail"],
      });
      queryClient.invalidateQueries({
        queryKey: ["invoices-by-booking", bookingId],
      });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Lỗi khi thêm completed charges");
    },
  });
}
