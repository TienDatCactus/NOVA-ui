import { useQuery } from "@tanstack/react-query";
import { OrderService } from "~/services/api/orders";

/**
 * Get list of all service orders (or filter by booking)
 */
export function useServiceOrderList(bookingId?: string) {
  return useQuery({
    queryKey: bookingId
      ? ["service-orders", "by-booking", bookingId]
      : ["service-orders", "all"],
    queryFn: async () => {
      if (bookingId) {
        return await OrderService.getServiceOrdersByBooking(bookingId);
      }
      return [];
    },
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
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
