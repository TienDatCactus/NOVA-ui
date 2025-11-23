import { useQuery } from "@tanstack/react-query";
import { OrderService } from "~/services/api/orders";

/**
 * Get list of POS orders by date
 * @param date - Optional date string (yyyy-MM-dd). If not provided, returns today's orders
 * @returns Array of POS orders for the specified date
 */
export function usePOSOrderList(date?: string) {
  return useQuery({
    queryKey: ["pos-order-list", date ? date : ""],
    queryFn: async () => await OrderService.getPosOrderList(date),
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: false,
  });
}

/**
 * Get detailed information for a single POS order
 * @param orderId - POS Order ID
 * @param enabled - Whether to enable the query (default: true)
 * @returns Complete order details including items, pricing, and status
 */
export function usePOSOrderDetail(orderId: string, enabled: boolean = true) {
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
 * @returns Formatted receipt data ready for printing
 */
export function usePOSOrderPrintData(orderId: string, enabled: boolean = true) {
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

export function usePOSOrderDetailByOrder(
  orderId: string,
  enabled: boolean = true
) {
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
