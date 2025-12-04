import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BookingService } from "~/services/api/booking";
import type {
  BookingPayForRoomRequestDto,
  BookingUpgradeRoomRequestDto,
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
    staleTime: 6000, // Always fetch fresh data
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
    queryKey: [
      "calculate-fees",
      data.subtotalAmount,
      data.applyVat,
      data.applyServiceCharge,
    ],
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
    queryKey: ["booking-invoices", bookingId],
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
        queryKey: ["booking-invoices", bookingId],
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
      toast.success("Thanh toán checkout thành công");
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({
        queryKey: ["checkout", "pending-charges", bookingId],
      });
      queryClient.invalidateQueries({
        queryKey: ["bookings-detail"],
      });
      queryClient.invalidateQueries({
        queryKey: ["booking-invoices", bookingId],
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
 * Hook to process payment for non-checkout invoices
 */
export function useInvoicePayment(invoiceId: string, bookingId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { method: string; amount: number; note?: string }) =>
      InvoicesService.proceedInvoicePayment(invoiceId, {
        method: data.method,
        amount: data.amount,
        note: data.note || "",
      }),
    onSuccess: () => {
      toast.success("Thanh toán hóa đơn thành công");
      // Invalidate specific invoice detail
      queryClient.invalidateQueries({
        queryKey: ["invoice-detail", invoiceId],
      });
      // Invalidate booking-specific invoice list (matches useInvoicesByBooking)
      queryClient.invalidateQueries({
        queryKey: ["booking-invoices", bookingId],
      });
      // Invalidate all booking details
      queryClient.invalidateQueries({
        queryKey: ["bookings-detail"],
      });
      // Invalidate pending charges to refresh UI
      queryClient.invalidateQueries({
        queryKey: ["checkout", "pending-charges", bookingId],
      });
    },
    onError: (error: any) => {
      console.error("Invoice payment failed:", error);
      toast.error(
        error?.response?.data?.message ||
          "Thanh toán hóa đơn thất bại. Vui lòng thử lại."
      );
    },
  });
}

/**
 * Hook to sync invoice with pending orders
 */
export function useSyncInvoiceWithOrders(invoiceId: string, bookingId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => InvoicesService.syncInvoiceWithOrders(invoiceId),
    onSuccess: () => {
      // Invalidate specific invoice detail
      queryClient.invalidateQueries({
        queryKey: ["invoice-detail", invoiceId],
      });
      // Invalidate booking-specific invoice list
      queryClient.invalidateQueries({
        queryKey: ["booking-invoices", bookingId],
      });
      // Invalidate booking-specific pending charges
      queryClient.invalidateQueries({
        queryKey: ["checkout", "pending-charges", bookingId],
      });
      // Invalidate all booking details
      queryClient.invalidateQueries({
        queryKey: ["bookings-detail"],
      });
    },
    onError: (error: any) => {
      console.error("Sync invoice failed:", error);
      toast.error(
        error?.response?.data?.message ||
          "Đồng bộ hóa đơn thất bại. Vui lòng thử lại."
      );
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
      toast.success("Checkout hoàn tất thành công");
      // Invalidate all booking lists
      queryClient.invalidateQueries({
        queryKey: ["bookings"],
      });
      // Invalidate all booking details
      queryClient.invalidateQueries({
        queryKey: ["bookings-detail"],
      });
      // Invalidate booking-specific invoice list
      queryClient.invalidateQueries({
        queryKey: ["booking-invoices", bookingId],
      });
      // Invalidate rooms week view
      queryClient.invalidateQueries({
        queryKey: ["bookings-rooms-week"],
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
        queryKey: ["booking-invoices"],
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
        queryKey: ["booking-invoices", bookingId],
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
        queryKey: ["booking-invoices", bookingId],
      });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Lỗi khi thêm completed charges");
    },
  });
}

export function usePayNowRooms(bookingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: BookingPayForRoomRequestDto) => {
      return await BookingService.payForRooms(bookingId, data);
    },
    onSuccess: () => {
      toast.success("Thanh toán phòng thành công", {
        description: "Invoice đã được tạo và thanh toán.",
      });

      // Invalidate booking detail to refetch updated data
      queryClient.invalidateQueries({
        queryKey: ["booking-detail", bookingId],
      });

      // Invalidate booking list if present
      queryClient.invalidateQueries({
        queryKey: ["bookings"],
      });
    },
    onError: (error: any) => {
      console.error("Pay-now-rooms error:", error);
      toast.error("Lỗi thanh toán phòng", {
        description:
          error?.response?.data?.message ||
          error?.message ||
          "Vui lòng thử lại sau.",
      });
    },
  });
}

export function useUpgradeRoom(bookingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: BookingUpgradeRoomRequestDto) => {
      return await BookingService.upgradeRoom(bookingId, data);
    },
    onSuccess: () => {
      toast.success("Upgrade phòng thành công", {
        description: "Phòng đã được nâng cấp.",
      });

      // Invalidate booking detail to refetch updated data
      queryClient.invalidateQueries({
        queryKey: ["booking-detail", bookingId],
      });

      // Invalidate booking list if present
      queryClient.invalidateQueries({
        queryKey: ["bookings"],
      });
    },
    onError: (error: any) => {
      console.error("Upgrade room error:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Vui lòng thử lại sau.";

      toast.error("Lỗi upgrade phòng", {
        description: errorMessage,
      });
    },
  });
}
