import { useMutation, useQueryClient } from "@tanstack/react-query";
import { OrderService } from "~/services/api/orders";
import type {
  CreatePOSOrderRequestDto,
  POSOrderPayNowRequestDto,
  AddSingleItemToPOSOrderRequestDto,
  AddBatchItemsToPOSOrderRequestDto,
} from "~/services/api/orders/dto";
import type { MenuPosCartItem } from "~/store/menu-pos-order.store";

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
        queryKey: ["pos-order-list"],
      });
    },
  });
}

/**
 * DEPRECATED: This hook needs refactoring as createPOSOrder now returns void
 * TODO: Backend should return order ID after creation for this pattern to work
 */
function useCreatePosOrderAndItems() {
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
      items: MenuPosCartItem[];
    }) => {
      const order = await OrderService.createPOSOrder({
        bookingId: bookingId || undefined,
        bookingRoomId: bookingRoomId || undefined,
        scheduledAt: scheduledAt || undefined,
        notes: notes || undefined,
      });

      await OrderService.addBatchItemsToPOSOrder(order.posOrderId, items);

      if (scheduledAt) {
        await OrderService.setScheduledOrder(order.posOrderId, {
          scheduledAt: new Date(scheduledAt),
        });
      }

      return order;
    },
  });
}

/**
 * Add a single item to an existing POS order
 * Invalidates: specific order detail and invoice orders list
 */
function useAddSingleItemToPOSOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      data,
    }: {
      orderId: string;
      data: AddSingleItemToPOSOrderRequestDto;
    }) => {
      return await OrderService.addItemToPOSOrder(orderId, data);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["pos-order-detail", variables.orderId],
      });
      queryClient.invalidateQueries({
        queryKey: ["pos-order-list"],
      });
    },
  });
}

/**
 * Add batch items to an existing POS order
 * Invalidates: specific order detail and invoice orders list
 */
function useAddBatchItemsToPOSOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      data,
    }: {
      orderId: string;
      data: AddBatchItemsToPOSOrderRequestDto;
    }) => {
      return await OrderService.addBatchItemsToPOSOrder(orderId, data);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["pos-order-detail", variables.orderId],
      });
      queryClient.invalidateQueries({
        queryKey: ["pos-order-list"],
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
        queryKey: ["pos-order-list"],
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
        queryKey: ["pos-order-list"],
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
        queryKey: ["pos-order-list"],
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
        queryKey: ["pos-order-list"],
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
        queryKey: ["pos-order-list"],
      });
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
    },
  });
}

/**
 * Update note for POS order
 * Invalidates: specific order detail and orders list
 */
function useUpdatePOSOrderNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      note,
    }: {
      orderId: string;
      note: string;
    }) => {
      return await OrderService.updatePOSOrderNote(orderId, { note });
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["pos-order-detail", variables.orderId],
      });
      queryClient.invalidateQueries({
        queryKey: ["pos-order-list"],
      });
    },
  });
}

export {
  useAddSingleItemToPOSOrder,
  useAddBatchItemsToPOSOrder,
  useCancelPOSOrder,
  useCompletePOSOrder,
  useCreatePOSOrder,
  useCreatePosOrderAndItems,
  useDeleteItemFromPOSOrder,
  usePayPOSOrderNow,
  useSetScheduledOrder,
  useSetServedOrderItem,
  useUpdatePOSOrderNote,
};
