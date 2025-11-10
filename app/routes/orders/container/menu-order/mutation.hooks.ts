import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import type z from "zod";
import { OrderService } from "~/services/api/orders";
import type { PaymentSchema } from "~/services/schema/payment.schema";

/**
 * Cancel a POS order
 * Invalidates order list to refresh UI
 */
function useCancelPOSOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => OrderService.cancelPOSOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pos-order-list"] });
      queryClient.invalidateQueries({ queryKey: ["pos-order-detail"] });
      toast.success("Đã hủy đơn hàng");
    },
  });
}

/**
 * Complete a POS order
 * Marks order as completed and ready for checkout
 */
function useCompletePOSOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => OrderService.completePOSOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pos-order-list"] });
      queryClient.invalidateQueries({ queryKey: ["pos-order-detail"] });
      toast.success("Đơn hàng đã hoàn thành");
    },
  });
}

/**
 * Pay for order immediately
 * Processes payment and updates order status
 * Note: After successful payment, order automatically becomes "Completed"
 */
function usePayPOSOrderNow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      data,
    }: {
      orderId: string;
      data: {
        paymentMethod: z.infer<typeof PaymentSchema.PaymentMethodEnum>;
        paidAmount: number;
        transactionReference: string;
      };
    }) => OrderService.payPOSOrderNow(orderId, data),
    onSuccess: () => {
      toast.success("Thanh toán thành công! Đơn hàng đã hoàn thành.");
      queryClient.invalidateQueries({ queryKey: ["pos-order-list"] });
      queryClient.invalidateQueries({ queryKey: ["pos-order-detail"] });
    },
  });
}

/**
 * Get print data for order
 * Fetches formatted receipt data
 */
function usePrintPOSOrder() {
  return useMutation({
    mutationFn: async (orderId: string) => {
      return await OrderService.getPOSOrderPrintData(orderId);
    },
  });
}

/**
 * Add single item to existing order
 */
function useAddItemToPOSOrder() {
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
      return await OrderService.addItemToPOSOrder(orderId, {
        menuItemId,
        customItemName,
        customItemDescription,
        quantity,
        unitPrice,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pos-order-list"] });
      queryClient.invalidateQueries({ queryKey: ["pos-order-detail"] });
      toast.success("Đã thêm món");
    },
  });
}

/**
 * Delete item from order
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pos-order-list"] });
      queryClient.invalidateQueries({ queryKey: ["pos-order-detail"] });
      toast.success("Đã xóa món");
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
      queryClient.invalidateQueries({ queryKey: ["pos-order-detail"] });
      toast.success("Đã cập nhật giờ hẹn");
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
      queryClient.invalidateQueries({ queryKey: ["pos-order-detail"] });
      toast.success("Đã đánh dấu phục vụ");
    },
  });
}

/**
 * Update note for POS order
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pos-order-list"] });
      queryClient.invalidateQueries({ queryKey: ["pos-order-detail"] });
      toast.success("Đã cập nhật ghi chú");
    },
  });
}

export {
  useCancelPOSOrder,
  useCompletePOSOrder,
  usePayPOSOrderNow,
  usePrintPOSOrder,
  useAddItemToPOSOrder,
  useDeleteItemFromPOSOrder,
  useUpdateScheduledTime,
  useMarkItemServed,
  useUpdatePOSOrderNote,
};
