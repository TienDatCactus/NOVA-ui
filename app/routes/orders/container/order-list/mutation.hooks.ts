import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { OrderService } from "~/services/api/orders";

/**
 * Cancel a POS order
 * Invalidates order list to refresh UI
 */
function useCancelOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => OrderService.cancelPOSOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pos-order-list"] });
    },
  });
}

/**
 * Complete a POS order
 * Marks order as completed and ready for checkout
 */
function useCompleteOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => OrderService.completePOSOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pos-order-list"] });
    },
  });
}

/**
 * Pay for order immediately
 * Processes payment and updates order status
 */
function usePayNow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      data,
    }: {
      orderId: string;
      data: {
        paymentMethod: string;
        paidAmount: number;
        transactionReference: string;
      };
    }) => OrderService.payPOSOrderNow(orderId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pos-order-list"] });
    },
  });
}

/**
 * Get print data for order
 * Fetches formatted receipt data
 */
function usePrintOrder() {
  return useMutation({
    mutationFn: async (orderId: string) => {
      return await OrderService.getPOSOrderPrintData(orderId);
    },
  });
}

/**
 * Add items to existing order
 */
function useAddItemToOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      menuItemId,
      customItemName,
      customItemDescription,
      quantity,
      unitPrice,
    }: {
      orderId: string;
      menuItemId?: string;
      customItemName?: string;
      customItemDescription?: string;
      quantity: number;
      unitPrice: number;
    }) => {
      return await OrderService.addItemsToPOSOrder(orderId, {
        menuItemId,
        customItemName,
        customItemDescription,
        quantity,
        unitPrice,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pos-order-list"] });
    },
  });
}

/**
 * Delete item from order
 */
function useDeleteItemFromOrder() {
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pos-order-list"] });
    },
  });
}

/**
 * Update scheduled serving time
 */
function useUpdateScheduledTime() {
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pos-order-list"] });
    },
  });
}

/**
 * Mark individual item as served
 */
function useMarkItemServed() {
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pos-order-list"] });
    },
  });
}

export {
  useCancelOrder,
  useCompleteOrder,
  usePayNow,
  usePrintOrder,
  useAddItemToOrder,
  useDeleteItemFromOrder,
  useUpdateScheduledTime,
  useMarkItemServed,
};
