import { useQuery } from "@tanstack/react-query";
import { OrderService } from "~/services/api/orders";

/**
 * Get list of all service orders (or filter by booking)
 */
export function useServiceOrderList(date?: string) {
  return useQuery({
    queryKey: ["service-order-list", date],
    queryFn: async () => {
      return await OrderService.getServiceOrderList(date);
    },
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: false,
  });
}

/**
 * Get detailed information for a single service order
 */
export function useServiceOrderDetail(orderId: string, enabled = true) {
  return useQuery({
    queryKey: ["service-order-detail", orderId],
    queryFn: async () => await OrderService.getServiceOrderDetail(orderId),
    staleTime: 30 * 1000,
    enabled: !!orderId && enabled,
    refetchOnWindowFocus: true,
  });
}
