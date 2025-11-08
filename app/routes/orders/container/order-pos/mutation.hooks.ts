import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { OrderService } from "~/services/api/orders";
import type {
  CreatePOSOrderRequestDto,
  AddItemsToPOSOrderRequestDto,
  POSOrderPayNowRequestDto,
} from "~/services/api/orders/dto";
import type { PosCartItem } from "~/store/pos-order.store";

/**
 * Create a new POS order
 * Invalidates: pos-orders list for the invoice
 * Uses idempotency key to prevent duplicate orders
 */
function useCreatePOSOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePOSOrderRequestDto) => {
      return await OrderService.createPOSOrder(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["pos-orders", "by-invoice"],
      });
    },
  });
}
function useCreatePosOrderAndItems() {
  return useMutation({
    mutationFn: async ({
      bookingId,
      bookingRoomId,
      servedAt,
      items,
    }: {
      bookingId?: string | null;
      bookingRoomId?: string | null;
      servedAt?: string | null;
      items: PosCartItem[];
    }) => {
      const order = await OrderService.createPOSOrder({
        bookingId: bookingId || undefined,
        bookingRoomId: bookingRoomId || undefined,
        servedAt: servedAt || undefined,
      });

      for (const item of items) {
        await OrderService.addItemsToPOSOrder(order.posOrderId, {
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        });
      }

      return order;
    },
    onError: (error: any) => {
      console.error("Error creating POS order:", error);
      toast.error(error.message || "Không thể tạo đơn hàng. Vui lòng thử lại.");
    },
  });
}

/**
 * Add an item to an existing POS order
 * Invalidates: specific order detail and invoice orders list
 * Uses idempotency key to prevent duplicate item additions
 */
function useAddItemToPOSOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      data,
    }: {
      orderId: string;
      data: AddItemsToPOSOrderRequestDto;
    }) => {
      return await OrderService.addItemsToPOSOrder(orderId, data);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["pos-order-detail", variables.orderId],
      });
      queryClient.invalidateQueries({
        queryKey: ["pos-orders", "by-invoice"],
      });
    },
  });
}

/**
 * Delete an item from a POS order
 * Invalidates: specific order detail and invoice orders list
 * Uses idempotency key to prevent duplicate deletions
 */
function useDeleteItemFromPOSOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      itemId,
    }: {
      orderId: string;
      itemId: string;
    }) => {
      return await OrderService.deleteItemFromPOSOrder(orderId, itemId);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["pos-order-detail", variables.orderId],
      });
      queryClient.invalidateQueries({
        queryKey: ["pos-orders", "by-invoice"],
      });
    },
  });
}

/**
 * Complete a POS order
 * Marks the order as completed and locks it from further edits
 * Uses idempotency key to prevent duplicate completions
 */
function useCompletePOSOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      return await OrderService.completePOSOrder(orderId);
    },
    onSuccess: (orderId) => {
      queryClient.invalidateQueries({
        queryKey: ["pos-order-detail", orderId],
      });
      queryClient.invalidateQueries({
        queryKey: ["pos-orders", "by-invoice"],
      });
    },
  });
}

/**
 * Cancel a POS order
 * Marks the order as cancelled and prevents further modifications
 * Uses idempotency key to prevent duplicate cancellations
 */
function useCancelPOSOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      return await OrderService.cancelPOSOrder(orderId);
    },
    onSuccess: (orderId) => {
      queryClient.invalidateQueries({
        queryKey: ["pos-order-detail", orderId],
      });
      queryClient.invalidateQueries({
        queryKey: ["pos-orders", "by-invoice"],
      });
    },
  });
}

function usePayPOSOrderNow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      orderId,
      data,
    }: {
      orderId: string;
      data: POSOrderPayNowRequestDto;
    }) => {
      return await OrderService.payPOSOrderNow(orderId, data);
    },
    onSuccess: (orderId) => {
      queryClient.invalidateQueries({
        queryKey: ["pos-order-detail", orderId],
      });
      queryClient.invalidateQueries({
        queryKey: ["pos-orders", "by-invoice"],
      });
    },
  });
}

export {
  useCreatePOSOrder,
  useAddItemToPOSOrder,
  useDeleteItemFromPOSOrder,
  useCompletePOSOrder,
  useCancelPOSOrder,
  usePayPOSOrderNow,
  useCreatePosOrderAndItems,
};
