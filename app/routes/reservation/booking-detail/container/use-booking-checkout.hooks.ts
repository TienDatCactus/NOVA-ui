import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import type z from "zod";
import { usePaymentRedirect } from "~/hooks/use-payment-redirect";
import { BookingService } from "~/services/api/booking";
import type {
  BookingPayForRoomRequestDto,
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
import type { PaymentSchema } from "~/services/api/payments/payments.schema";

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
  enabled = false,
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
  enabled = false,
) {
  return useQuery({
    queryKey: [
      "calculate-fees",
      data.subtotalAmount,
      data.applyVat,
      data.applyServiceCharge,
    ],
    queryFn: () => InvoicesService.calculateInvoiceFees(data),
    enabled: enabled,
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
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["bookings-detail"],
          exact: false,
        }),
        queryClient.invalidateQueries({
          queryKey: ["booking-invoices"],
          exact: false,
        }),
        queryClient.invalidateQueries({
          queryKey: ["checkout", "pending-charges", bookingId],
        }),
      ]);

      toast.success("Tạo hóa đơn checkout thành công");
    },
    onError: (error) => {
      if (error instanceof AxiosError)
        toast.error(error.response?.data.message);
    },
  });
}

/**
 * Hook to process checkout payment
 */
export function useCheckoutPayment(bookingId: string) {
  const queryClient = useQueryClient();
  const { handlePaymentResponse } = usePaymentRedirect();

  return useMutation({
    mutationFn: (data: StaffCheckoutPaymentRequestDto) =>
      BookingService.staffCheckoutPayment(bookingId, data),
    onSuccess: async (response) => {
      // Check if payment requires redirect (Card/BankTransfer)
      const redirected = handlePaymentResponse(response as any);

      if (redirected) {
        // User will be redirected to payment gateway
        // Success toast will be shown after callback
        return;
      }

      // Cash payment completed - invalidate queries and show success
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["bookings-detail"],
          exact: false,
        }),
        queryClient.invalidateQueries({
          queryKey: ["booking-invoices"],
          exact: false,
        }),
        queryClient.invalidateQueries({
          queryKey: ["invoice-detail"],
          exact: false,
        }),
        queryClient.invalidateQueries({
          queryKey: ["checkout", "pending-charges", bookingId],
        }),
      ]);

      toast.success("Thanh toán checkout thành công");
    },
    onError: (error) => {
      if (error instanceof AxiosError)
        toast.error(error.response?.data.message);
    },
  });
}

/**
 * Hook to process payment for non-checkout invoices
 */
export function useInvoicePayment(invoiceId: string, bookingId: string) {
  const queryClient = useQueryClient();
  const { handlePaymentResponse } = usePaymentRedirect();

  return useMutation({
    mutationFn: (data: {
      method: string;
      amount: number;
      note?: string;
      successUrl?: string;
      cancelUrl?: string;
      description?: string;
    }) =>
      InvoicesService.proceedInvoicePayment(invoiceId, {
        method: data.method as z.infer<typeof PaymentSchema.PaymentMethodEnum>,
        amount: data.amount,
        note: data.note || "",
        successUrl: data.successUrl,
        cancelUrl: data.cancelUrl,
        description: data.description,
      }),
    onSuccess: async (response) => {
      // Check if payment requires redirect (Card/BankTransfer)
      const redirected = handlePaymentResponse(response);

      if (redirected) {
        // User will be redirected to payment gateway
        // Success toast will be shown after callback
        return;
      }

      // Cash payment completed - invalidate queries and show success
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["bookings-detail"],
          exact: false,
        }),
        queryClient.invalidateQueries({
          queryKey: ["booking-invoices"],
          exact: false,
        }),
        queryClient.invalidateQueries({
          queryKey: ["invoice-detail"],
          exact: false,
        }),
        queryClient.invalidateQueries({
          queryKey: ["checkout", "pending-charges", bookingId],
        }),
      ]);

      toast.success("Thanh toán hóa đơn thành công");
    },
    onError: (error) => {
      if (error instanceof AxiosError)
        toast.error(error.response?.data.message);
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
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["bookings-detail"],
          exact: false,
        }),
        queryClient.invalidateQueries({
          queryKey: ["booking-invoices"],
          exact: false,
        }),
        queryClient.invalidateQueries({
          queryKey: ["invoice-detail"],
          exact: false,
        }),
        queryClient.invalidateQueries({
          queryKey: ["checkout", "pending-charges", bookingId],
        }),
      ]);

      toast.success("Đồng bộ hóa đơn với các đơn hàng thành công");
    },
    onError: (error) => {
      if (error instanceof AxiosError)
        toast.error(error.response?.data.message);
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
          queryKey: ["booking-invoices"],
          exact: false,
        }),
        queryClient.invalidateQueries({
          queryKey: ["checkout", "pending-charges", bookingId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["bookings-rooms-week"],
        }),
      ]);

      // Force refetch to ensure UI updates immediately
      await queryClient.refetchQueries({
        queryKey: ["bookings-detail"],
        exact: false,
      });

      toast.success("Checkout thành công");
    },
    onError: (error) => {
      if (error instanceof AxiosError)
        toast.error(error.response?.data.message);
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
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["invoice-detail"],
          exact: false,
        }),
        queryClient.invalidateQueries({
          queryKey: ["bookings-detail"],
          exact: false,
        }),
        queryClient.invalidateQueries({
          queryKey: ["booking-invoices"],
          exact: false,
        }),
      ]);

      toast.success("Cập nhật invoice thành công");
    },
    onError: (error) => {
      if (error instanceof AxiosError)
        toast.error(error.response?.data.message);
    },
  });
}

export function useConfirmBookingPayment(bookingId: string) {
  const queryClient = useQueryClient();
  const { handlePaymentResponse } = usePaymentRedirect();

  return useMutation({
    mutationFn: (data: ConfirmBookingPaymentRequestDto) =>
      BookingService.staffConfirmBookingPayment(bookingId || "", data),
    onSuccess: async (response) => {
      // Check if payment requires redirect (Card/BankTransfer)
      const redirected = handlePaymentResponse(response);

      if (redirected) {
        // User will be redirected to payment gateway
        // Success toast will be shown after callback
        return;
      }

      // Cash payment completed - invalidate queries and show success
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
          queryKey: ["booking-invoices"],
          exact: false,
        }),
        queryClient.invalidateQueries({
          queryKey: ["checkout", "pending-charges", bookingId],
        }),
      ]);

      toast.success(response.message || "Xác nhận thanh toán thành công");
    },
    onError: (error) => {
      if (error instanceof AxiosError)
        toast.error(error.response?.data.message);
    },
  });
}

export function useAddCompletedCharges(bookingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: StaffAddCompletedChargesRequestDto) =>
      await BookingService.staffAddCompletedCharges(bookingId, data),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["bookings-detail"],
          exact: false,
        }),
        queryClient.invalidateQueries({
          queryKey: ["booking-invoices"],
          exact: false,
        }),
        queryClient.invalidateQueries({
          queryKey: ["checkout", "pending-charges", bookingId],
        }),
      ]);

      toast.success("Đã thêm completed charges thành công");
    },
    onError: (error) => {
      if (error instanceof AxiosError)
        toast.error(error.response?.data.message);
    },
  });
}

export function usePayNowRooms(bookingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: BookingPayForRoomRequestDto) => {
      return await BookingService.payForRooms(bookingId, data);
    },
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
          queryKey: ["booking-invoices"],
          exact: false,
        }),
        queryClient.invalidateQueries({
          queryKey: ["checkout", "pending-charges", bookingId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["unpaid-rooms", bookingId],
        }),
      ]);

      toast.success("Thanh toán phòng thành công", {
        description: "Invoice đã được tạo và thanh toán.",
      });
    },
    onError: (error) => {
      if (error instanceof AxiosError)
        toast.error(error.response?.data.message);
    },
  });
}

export function useUnpaidRooms(
  bookingId: string,
  options?: { enabled: boolean },
) {
  return useQuery({
    queryKey: ["unpaid-rooms", bookingId],
    queryFn: () => BookingService.unpaidRooms(bookingId),
    enabled: options?.enabled ?? !!bookingId,
    staleTime: 5 * 60 * 1000,
  });
}
