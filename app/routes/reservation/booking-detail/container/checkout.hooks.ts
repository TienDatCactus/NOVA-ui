import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BookingService } from "~/services/api/booking";
import { InvoicesService } from "~/services/api/invoices";
import type {
  StaffCheckoutRequestDto,
  BookingPendingChargesResponseDto,
} from "~/services/api/booking/dto";
import type {
  InvoicePreviewRequestDto,
  InvoicePreviewResponseDto,
} from "~/services/api/invoices/dto";
import { useState } from "react";

/**
 * Main hook for booking checkout flow
 * Manages: pending charges → invoice creation → payment → checkout completion
 */
export function useBookingCheckout(bookingId: string, enabled: boolean) {
  const queryClient = useQueryClient();
  const [invoiceCreated, setInvoiceCreated] = useState(false);
  const [paymentProcessed, setPaymentProcessed] = useState(false);

  // Step 1: Load pending charges
  const {
    data: pendingCharges,
    isPending: loadingCharges,
    error: chargesError,
  } = useQuery({
    queryKey: ["booking-pending-charges", bookingId],
    queryFn: () => BookingService.getBookingPendingCharges(bookingId),
    enabled: enabled && !!bookingId,
    staleTime: 0, // Always fresh data
    refetchOnWindowFocus: false,
  });

  // Step 2: Create invoice (preview)
  const {
    mutate: createInvoice,
    data: invoicePreview,
    isPending: isCreatingInvoice,
    error: invoiceError,
  } = useMutation({
    mutationFn: async (data: InvoicePreviewRequestDto) => {
      return await InvoicesService.previewBookingInvoice(data);
    },
    onSuccess: () => {
      setInvoiceCreated(true);
      toast.success("Hóa đơn đã được tạo thành công");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Không thể tạo hóa đơn. Vui lòng thử lại.");
    },
  });

  // Step 3: Process payment
  const {
    mutate: processPayment,
    isPending: isProcessingPayment,
    error: paymentError,
  } = useMutation({
    mutationFn: async (data: StaffCheckoutRequestDto) => {
      return await BookingService.staffCheckoutPayment(bookingId, data);
    },
    onSuccess: () => {
      setPaymentProcessed(true);
      toast.success("Thanh toán đã được xử lý thành công");

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({
        queryKey: ["booking-detail", bookingId],
      });
      queryClient.invalidateQueries({
        queryKey: ["booking-pending-charges", bookingId],
      });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Thanh toán thất bại. Vui lòng thử lại.");
    },
  });

  // Step 4: Complete checkout
  const {
    mutate: completeCheckout,
    isPending: isCompletingCheckout,
    error: checkoutError,
  } = useMutation({
    mutationFn: async (data: StaffCheckoutRequestDto) => {
      return await BookingService.staffCheckout(bookingId, data);
    },
    onSuccess: () => {
      toast.success("Checkout hoàn tất thành công!");

      // Invalidate all related queries
      queryClient.invalidateQueries({
        queryKey: ["booking-detail", bookingId],
      });
      queryClient.invalidateQueries({
        queryKey: ["booking-list"],
      });
      queryClient.invalidateQueries({
        queryKey: ["booking-list-by-week"],
      });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Checkout thất bại. Vui lòng thử lại.");
    },
  });

  return {
    // Step 1: Pending Charges
    pendingCharges,
    loadingCharges,
    chargesError,
    totalPendingAmount: pendingCharges?.summary.totalDue || 0,
    roomBalance: pendingCharges?.summary.roomBalance || 0,
    pendingChargesAmount: pendingCharges?.summary.pendingCharges || 0,

    // Step 2: Invoice Creation
    createInvoice,
    invoicePreview,
    isCreatingInvoice,
    invoiceError,
    invoiceCreated,

    // Step 3: Payment Processing
    processPayment,
    isProcessingPayment,
    paymentError,
    paymentProcessed,

    // Step 4: Checkout Completion
    completeCheckout,
    isCompletingCheckout,
    checkoutError,

    // Reset states (if needed for retry)
    resetStates: () => {
      setInvoiceCreated(false);
      setPaymentProcessed(false);
    },
  };
}

/**
 * Hook for creating checkout invoice
 * Separate hook for invoice-only operations
 */
export function useCreateCheckoutInvoice(bookingId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return await BookingService.staffCreateCheckoutInvoice(bookingId);
    },
    onSuccess: (data) => {
      toast.success(`Hóa đơn ${data.invoiceNo} đã được tạo`);
      queryClient.invalidateQueries({
        queryKey: ["booking-detail", bookingId],
      });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Không thể tạo hóa đơn. Vui lòng thử lại.");
    },
  });
}

/**
 * Hook for fetching booking pending charges
 * Standalone query hook for manual refetch
 */
export function useBookingPendingCharges(bookingId: string, enabled = true) {
  return useQuery({
    queryKey: ["booking-pending-charges", bookingId],
    queryFn: () => BookingService.getBookingPendingCharges(bookingId),
    enabled: enabled && !!bookingId,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
  });
}
