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
      notes,
      items,
    }: {
      bookingId?: string | null;
      bookingRoomId?: string | null;
      servedAt?: string | null;
      notes?: string | null;
      items: PosCartItem[];
    }) => {
      // Step 1: Create the POS order
      const order = await OrderService.createPOSOrder({
        bookingId: bookingId || undefined,
        bookingRoomId: bookingRoomId || undefined,
        servedAt: servedAt || undefined,
        notes: notes || undefined,
      });

      // Step 2: Add items to the order
      for (const item of items) {
        await OrderService.addItemsToPOSOrder(order.posOrderId, {
          menuItemId: item.customItemName ? undefined : item.menuItemId,
          customItemName: item.customItemName,
          customItemDescription: item.customItemDescription,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        });
      }

      // Step 3: Set scheduled time if provided
      if (servedAt) {
        await OrderService.setScheduledOrder(order.posOrderId, {
          scheduledAt: new Date(servedAt),
        });
      }

      return order;
    },
    onSuccess: () => {
      toast.success("Đã tạo đơn hàng thành công!");
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

/**
 * Set scheduled time for a POS order
 * Updates when the order should be prepared/served
 * Invalidates: specific order detail and orders list
 */
function useSetScheduledOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      scheduledAt,
    }: {
      orderId: string;
      scheduledAt: Date;
    }) => {
      return await OrderService.setScheduledOrder(orderId, { scheduledAt });
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["pos-order-detail", variables.orderId],
      });
      queryClient.invalidateQueries({
        queryKey: ["pos-orders"],
      });
      toast.success("Đã đặt thời gian phục vụ");
    },
    onError: (error: any) => {
      console.error("Error setting scheduled time:", error);
      toast.error(
        error.message || "Không thể đặt thời gian phục vụ. Vui lòng thử lại."
      );
    },
  });
}

/**
 * Set served time for a specific item in a POS order
 * Marks when an item was actually served to customer
 * Invalidates: specific order detail
 */
function useSetServedOrderItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      itemId,
      servedAt,
    }: {
      orderId: string;
      itemId: string;
      servedAt: Date;
    }) => {
      return await OrderService.setServedOrderItem(orderId, itemId, {
        servedAt,
      });
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["pos-order-detail", variables.orderId],
      });
      toast.success("Đã đánh dấu món đã phục vụ");
    },
    onError: (error: any) => {
      console.error("Error setting served time:", error);
      toast.error(
        error.message || "Không thể đánh dấu món đã phục vụ. Vui lòng thử lại."
      );
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
  useSetScheduledOrder,
  useSetServedOrderItem,
};
