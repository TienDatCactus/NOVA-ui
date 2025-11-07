import { useQuery } from "@tanstack/react-query";
import { InvoicesService } from "~/services/api/invoices";
import type { InvoiceListParams } from "~/services/api/invoices/invoice.types";

/**
 * Hook to fetch list of invoices with pagination and filters
 */
export function useInvoices(params?: InvoiceListParams) {
  return useQuery({
    queryKey: ["invoices", params],
    queryFn: async () => await InvoicesService.getInvoiceList(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
}

/**
 * Hook to fetch invoice detail by ID
 */
export function useInvoiceDetail(invoiceId: string) {
  return useQuery({
    queryKey: ["invoice-detail", invoiceId],
    queryFn: async () => await InvoicesService.getInvoiceDetail(invoiceId),
    enabled: !!invoiceId, // Only fetch if invoiceId is provided
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
}
