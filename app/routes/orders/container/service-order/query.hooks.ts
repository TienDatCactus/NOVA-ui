import { useQuery } from "@tanstack/react-query";
import { OrderService } from "~/services/api/orders";

/**
 * Get list of all service orders (or filter by date)
 */
export function useServiceOrderList(date?: string) {
  return useQuery({
    queryKey: ["service-order-list", date],
    queryFn: async () => {
      return await OrderService.getServiceOrderList(date);
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: true,
  });
}

/**
 * Get detailed information for a single service order
 */
export function useServiceOrderDetail(
  orderId: string,
  options?: { enabled: boolean }
) {
  return useQuery({
    queryKey: ["service-order-detail", orderId],
    queryFn: async () => await OrderService.getServiceOrderDetail(orderId),
    staleTime: 30 * 1000,
    enabled: !!orderId && options?.enabled,
    refetchOnWindowFocus: true,
  });
}
