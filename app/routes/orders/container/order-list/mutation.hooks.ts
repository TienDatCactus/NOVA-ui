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
      queryClient.invalidateQueries({ queryKey: ["pos-orders"] });
      toast.success("Đơn hàng đã hủy thành công");
    },
    onError: (error: any) => {
      console.error("Error cancelling order:", error);
      toast.error(error.message || "Không thể hủy đơn hàng. Vui lòng thử lại.");
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
      queryClient.invalidateQueries({ queryKey: ["pos-orders"] });
      toast.success("Đơn hàng đã hoàn thành");
    },
    onError: (error: any) => {
      console.error("Error completing order:", error);
      toast.error(
        error.message || "Không thể hoàn thành đơn hàng. Vui lòng thử lại."
      );
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
      queryClient.invalidateQueries({ queryKey: ["pos-orders"] });
      toast.success("Thanh toán thành công");
    },
    onError: (error: any) => {
      console.error("Error processing payment:", error);
      toast.error(error.message || "Không thể thanh toán. Vui lòng thử lại.");
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
    onError: (error: any) => {
      console.error("Error fetching print data:", error);
      toast.error(
        error.message || "Không thể lấy dữ liệu in. Vui lòng thử lại."
      );
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
      queryClient.invalidateQueries({ queryKey: ["pos-orders"] });
      toast.success("Đã thêm món vào đơn hàng");
    },
    onError: (error: any) => {
      console.error("Error adding item:", error);
      toast.error(error.message || "Không thể thêm món. Vui lòng thử lại.");
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
      queryClient.invalidateQueries({ queryKey: ["pos-orders"] });
      toast.success("Đã xóa món khỏi đơn hàng");
    },
    onError: (error: any) => {
      console.error("Error deleting item:", error);
      toast.error(error.message || "Không thể xóa món. Vui lòng thử lại.");
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
      queryClient.invalidateQueries({ queryKey: ["pos-orders"] });
      toast.success("Đã cập nhật thời gian phục vụ");
    },
    onError: (error: any) => {
      console.error("Error updating schedule:", error);
      toast.error(
        error.message || "Không thể cập nhật thời gian. Vui lòng thử lại."
      );
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
      queryClient.invalidateQueries({ queryKey: ["pos-orders"] });
      toast.success("Đã đánh dấu món đã phục vụ");
    },
    onError: (error: any) => {
      console.error("Error marking item served:", error);
      toast.error(error.message || "Không thể đánh dấu món. Vui lòng thử lại.");
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
