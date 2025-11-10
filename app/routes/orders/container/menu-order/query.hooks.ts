import { useQuery } from "@tanstack/react-query";
import { OrderService } from "~/services/api/orders";

/**
 * Get detailed information for a single POS order
 * @param orderId - POS Order ID
 * @param enabled - Whether to enable the query (default: true)
 */
function usePOSOrderDetailByOrder(orderId: string, enabled: boolean = true) {
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

/**
 * Get list of POS orders by date
 * @param date - Optional date string (yyyy-MM-dd). If not provided, returns today's orders
 */
function usePOSOrderList(date?: string) {
  return useQuery({
    queryKey: ["pos-order-list", date],
    queryFn: async () => await OrderService.getPosOrderList(date),
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: false,
  });
}

export { usePOSOrderList, usePOSOrderDetailByOrder, usePOSOrderPrintData };
