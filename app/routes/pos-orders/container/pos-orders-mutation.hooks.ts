import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { OrderService } from "~/services/api/orders";
import type {
  CreatePOSOrderRequestDto,
  AddItemsToPOSOrderRequestDto,
} from "~/services/api/orders/dto";

/**
 * Create a new POS order
 * Invalidates: pos-orders list for the invoice
 * Uses idempotency key to prevent duplicate orders
 */
function useCreatePOSOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePOSOrderRequestDto) => {
      const idempotencyKey = crypto.randomUUID();
      return await OrderService.createPOSOrder(data, idempotencyKey);
    },
    onSuccess: (data, variables) => {
      toast.success("Đơn hàng đã được tạo thành công");
      // Invalidate orders list - response doesn't include invoiceId
      queryClient.invalidateQueries({
        queryKey: ["pos-orders", "by-invoice"],
      });
    },
    onError: (error) => {
      console.error("Create POS order error:", error);
      toast.error("Không thể tạo đơn hàng. Vui lòng thử lại.");
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
      const idempotencyKey = crypto.randomUUID();
      return await OrderService.addItemsToPOSOrder(
        orderId,
        data,
        idempotencyKey
      );
    },
    onSuccess: (data, variables) => {
      toast.success("Đã thêm món vào đơn hàng");
      // Invalidate the order detail
      queryClient.invalidateQueries({
        queryKey: ["pos-order-detail", variables.orderId],
      });
      // Also invalidate orders list (total might change)
      queryClient.invalidateQueries({
        queryKey: ["pos-orders", "by-invoice"],
      });
    },
    onError: (error) => {
      console.error("Add item error:", error);
      toast.error("Không thể thêm món. Vui lòng thử lại.");
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
      const idempotencyKey = crypto.randomUUID();
      return await OrderService.deleteItemFromPOSOrder(
        orderId,
        itemId,
        idempotencyKey
      );
    },
    onSuccess: (data, variables) => {
      toast.success("Đã xóa món khỏi đơn hàng");
      // Invalidate the order detail
      queryClient.invalidateQueries({
        queryKey: ["pos-order-detail", variables.orderId],
      });
      // Also invalidate orders list (total might change)
      queryClient.invalidateQueries({
        queryKey: ["pos-orders", "by-invoice"],
      });
    },
    onError: (error) => {
      console.error("Delete item error:", error);
      toast.error("Không thể xóa món. Vui lòng thử lại.");
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
      const idempotencyKey = crypto.randomUUID();
      return await OrderService.completePOSOrder(orderId, idempotencyKey);
    },
    onSuccess: (data, orderId) => {
      toast.success("Đơn hàng đã hoàn thành");
      // Invalidate the order detail
      queryClient.invalidateQueries({
        queryKey: ["pos-order-detail", orderId],
      });
      // Invalidate orders list
      queryClient.invalidateQueries({
        queryKey: ["pos-orders", "by-invoice"],
      });
    },
    onError: (error) => {
      console.error("Complete order error:", error);
      toast.error("Không thể hoàn thành đơn hàng. Vui lòng thử lại.");
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
      const idempotencyKey = crypto.randomUUID();
      return await OrderService.cancelPOSOrder(orderId, idempotencyKey);
    },
    onSuccess: (data, orderId) => {
      toast.success("Đơn hàng đã bị hủy");
      // Invalidate the order detail
      queryClient.invalidateQueries({
        queryKey: ["pos-order-detail", orderId],
      });
      // Invalidate orders list
      queryClient.invalidateQueries({
        queryKey: ["pos-orders", "by-invoice"],
      });
    },
    onError: (error) => {
      console.error("Cancel order error:", error);
      toast.error("Không thể hủy đơn hàng. Vui lòng thử lại.");
    },
  });
}

export {
  useCreatePOSOrder,
  useAddItemToPOSOrder,
  useDeleteItemFromPOSOrder,
  useCompletePOSOrder,
  useCancelPOSOrder,
};
