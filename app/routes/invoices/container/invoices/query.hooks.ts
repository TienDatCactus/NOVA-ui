import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { InvoicesService } from "~/services/api/invoices";
import type { InvoiceListParams } from "~/services/api/invoices/invoice.types";

/**
 * Hook to fetch list of invoices with pagination and filters
 */
export function useInvoices(params?: InvoiceListParams) {
  return useQuery({
    queryKey: ["invoices", params],
    queryFn: async () => await InvoicesService.getInvoiceList(params),
    placeholderData: keepPreviousData,
  });
}

/**
 * Hook to fetch invoice detail by ID
 */
export function useInvoiceDetail(
  invoiceId: string,
  options?: {
    enabled?: boolean;
  }
) {
  return useQuery({
    queryKey: ["invoice-detail", invoiceId],
    queryFn: async () => await InvoicesService.getInvoiceDetail(invoiceId),
    enabled: options?.enabled && !!invoiceId,
  });
}

export function useInvoicesByBooking(
  bookingId: string,
  options?: { open: boolean }
) {
  return useQuery({
    queryKey: ["booking-invoices", bookingId, options?.open],
    queryFn: () => InvoicesService.getInvoicesByBooking(bookingId),
    enabled: options?.open && !!bookingId,
  });
}
