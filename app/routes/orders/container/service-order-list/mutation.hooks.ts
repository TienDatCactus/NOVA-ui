import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { OrderService } from "~/services/api/orders";
import type {
  CreateServiceOrderRequestDto,
  UpdateServiceOrderRequestDto,
  ServiceOrderPayNowRequestDto,
  SetScheduledServiceOrderRequestDto,
} from "~/services/api/orders/dto";
import type { ServicePosCartItem } from "~/store/service-pos-order.store";

/**
 * Create new service order
 */
export function useCreateServiceOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateServiceOrderRequestDto) =>
      OrderService.createServiceOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-orders"] });
      toast.success("Tạo service order thành công");
    },
  });
}

/**
 * Update service order
 */
export function useUpdateServiceOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      data,
    }: {
      orderId: string;
      data: UpdateServiceOrderRequestDto;
    }) => OrderService.updateServiceOrder(orderId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-orders"] });
    },
  });
}

/**
 * Complete service order
 */
export function useCompleteServiceOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => OrderService.completeServiceOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-orders"] });
    },
  });
}

/**
 * Cancel service order
 */
export function useCancelServiceOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => OrderService.cancelServiceOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-orders"] });
    },
  });
}

/**
 * Pay service order now (mid-stay)
 */
export function usePayServiceOrderNow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      data,
    }: {
      orderId: string;
      data: ServiceOrderPayNowRequestDto;
    }) => OrderService.payServiceOrderNow(orderId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-orders"] });
    },
  });
}

/**
 * Update scheduled time
 */
export function useUpdateServiceOrderSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      data,
    }: {
      orderId: string;
      data: SetScheduledServiceOrderRequestDto;
    }) => OrderService.setScheduledServiceOrder(orderId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-orders"] });
    },
  });
}

/**
 * Create service order with items (for Service POS)
 * Similar to menu POS but creates service orders instead
 */
export function useCreateServicePosOrderAndItems() {
  return useMutation({
    mutationFn: async ({
      bookingId,
      bookingRoomId,
      scheduledAt,
      notes,
      items,
    }: {
      bookingId?: string | null;
      bookingRoomId?: string | null;
      scheduledAt?: string | null;
      notes?: string | null;
      items: ServicePosCartItem[];
    }) => {
      // Create service orders for each item
      const createdOrders = [];

      for (const item of items) {
        const order = await OrderService.createServiceOrder({
          bookingId: bookingId || undefined,
          bookingRoomId: bookingRoomId || undefined,
          serviceItemId: item.serviceItemId || "",
          customServiceName: item.customServiceName,
          customServiceDescription: item.customServiceDescription,
          scheduledAt: scheduledAt || undefined,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          note: notes || undefined,
          assignedToStaffId: undefined, // Can be added later if needed
        });
        createdOrders.push(order);
      }

      return createdOrders;
    },
  });
}
