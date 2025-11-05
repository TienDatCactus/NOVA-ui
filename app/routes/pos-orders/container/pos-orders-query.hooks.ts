import { useQuery } from "@tanstack/react-query";
import { OrderService } from "~/services/api/orders";

/**
 * Get list of POS orders by invoice ID
 * @param invoiceId - Invoice ID to filter orders
 */
function usePOSOrdersByInvoice(invoiceId: string) {
  return useQuery({
    queryKey: ["pos-orders", "by-invoice", invoiceId],
    queryFn: async () => await OrderService.getPOSOrdersByInvoice(invoiceId),
    staleTime: 30 * 1000,
    enabled: !!invoiceId,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: false,
  });
}

/**
 * Get detailed information for a single POS order
 * @param orderId - POS Order ID
 * @param enabled - Whether to enable the query (default: true)
 */
function usePOSOrderDetail(orderId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["pos-order-detail", orderId],
    queryFn: async () => await OrderService.getPOSOrderDetail(orderId),
    staleTime: 30 * 1000, // 30 seconds
    enabled: !!orderId && enabled,
    refetchOnWindowFocus: true,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
}

/**
 * Get print data for a POS order
 * Used for kitchen tickets and customer receipts
 * @param orderId - POS Order ID
 * @param enabled - Whether to enable the query (default: true)
 */
function usePOSOrderPrintData(orderId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["pos-order-print-data", orderId],
    queryFn: async () => await OrderService.getPOSOrderPrintData(orderId),
    staleTime: 5 * 60 * 1000, // 5 minutes - print data changes less frequently
    enabled: !!orderId && enabled,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
}

export { usePOSOrdersByInvoice, usePOSOrderDetail, usePOSOrderPrintData };
