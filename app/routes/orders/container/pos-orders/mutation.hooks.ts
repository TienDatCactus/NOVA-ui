import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { OrderService } from "~/services/api/orders";
import type {
  CreatePOSOrderRequestDto,
  AddSingleItemToPOSOrderRequestDto,
  AddBatchItemsToPOSOrderRequestDto,
  OrderPayNowRequestDto,
} from "~/services/api/orders/dto";

/**
 * Create a new POS order
 * @returns Mutation object with posOrderId and status
 * Invalidates: pos-order-list
 */
export function useCreatePOSOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePOSOrderRequestDto) => {
      return await OrderService.createPOSOrder(data);
    },
    onSuccess: (_, data) => {
      // Invalidate all POS order lists (all dates)
      queryClient.invalidateQueries({ queryKey: ["pos-order-list"] });
      // Invalidate all order details
      queryClient.invalidateQueries({ queryKey: ["pos-order-detail"] });
      // Invalidate checkout pending charges
      queryClient.invalidateQueries({
        queryKey: ["checkout", "pending-charges", data.bookingId],
      });
      toast.success("Đã tạo order thành công");
    },
  });
}

/**
 * Add a single item to an existing POS order
 * @param orderId - POS Order ID
 * @param data - Item details (menuItemId or custom item)
 * Invalidates: specific order detail + pos-order-list
 */
export function useAddSingleItemToPOSOrder() {
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["pos-order-detail", variables.orderId],
      });
      queryClient.invalidateQueries({ queryKey: ["pos-order-list"] });
      queryClient.invalidateQueries({
        queryKey: ["checkout", "pending-charges"],
      });
      toast.success("Đã thêm món vào order");
    },
  });
}

/**
 * Add multiple items to an existing POS order in batch
 * @param orderId - POS Order ID
 * @param data - Array of items to add
 * Invalidates: specific order detail + pos-order-list
 */
export function useAddBatchItemsToPOSOrder() {
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["pos-order-detail", variables.orderId],
      });
      queryClient.invalidateQueries({ queryKey: ["pos-order-list"] });
      queryClient.invalidateQueries({
        queryKey: ["checkout", "pending-charges"],
      });
      toast.success("Đã thêm các món vào order");
    },
  });
}

/**
 * Delete an item from a POS order
 * @param orderId - POS Order ID
 * @param itemId - Item ID to delete
 * Invalidates: specific order detail + pos-order-list
 */
export function useDeleteItemFromPOSOrder() {
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["pos-order-detail", variables.orderId],
      });
      queryClient.invalidateQueries({ queryKey: ["pos-order-list"] });
      queryClient.invalidateQueries({
        queryKey: ["checkout", "pending-charges"],
      });
      toast.success("Đã xóa món khỏi order");
    },
  });
}

/**
 * Complete a POS order
 * Marks the order as completed and locks it from further edits
 * @param orderId - POS Order ID
 * Invalidates: specific order detail + pos-order-list
 */
export function useCompletePOSOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      return await OrderService.completePOSOrder(orderId);
    },
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({
        queryKey: ["pos-order-detail", orderId],
      });
      queryClient.invalidateQueries({ queryKey: ["pos-order-list"] });
      queryClient.invalidateQueries({
        queryKey: ["checkout", "pending-charges"],
      });
      toast.success("Đã hoàn thành order");
    },
  });
}

/**
 * Cancel a POS order
 * Marks the order as cancelled and prevents further modifications
 * @param orderId - POS Order ID
 * Invalidates: specific order detail + pos-order-list
 */
export function useCancelPOSOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      return await OrderService.cancelPOSOrder(orderId);
    },
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({
        queryKey: ["pos-order-detail", orderId],
      });
      queryClient.invalidateQueries({ queryKey: ["pos-order-list"] });
      queryClient.invalidateQueries({
        queryKey: ["checkout", "pending-charges"],
      });
      toast.success("Đã hủy order");
    },
  });
}

/**
 * Pay for POS order immediately
 * Processes payment and updates order status to Completed
 * @param orderId - POS Order ID
 * @param data - Payment details (method, amount, reference)
 * Invalidates: specific order detail + pos-order-list
 */
export function usePayPOSOrderNow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      data,
    }: {
      orderId: string;
      data: OrderPayNowRequestDto;
    }) => {
      return await OrderService.payPOSOrderNow(orderId, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["pos-order-detail", variables.orderId],
      });
      queryClient.invalidateQueries({ queryKey: ["pos-order-list"] });
      queryClient.invalidateQueries({
        queryKey: ["checkout", "pending-charges"],
      });
      toast.success("Đã thanh toán order");
    },
  });
}

/**
 * Set or update scheduled serving time for POS order
 * @param orderId - POS Order ID
 * @param scheduledAt - Date/time when order should be prepared/served
 * Invalidates: specific order detail + pos-order-list
 */
export function useSetScheduledPOSOrder() {
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["pos-order-detail", variables.orderId],
      });
      queryClient.invalidateQueries({ queryKey: ["pos-order-list"] });
      toast.success("Đã cập nhật thời gian phục vụ");
    },
  });
}

/**
 * Mark a specific item as served in POS order
 * Records when an item was actually delivered to customer
 * @param orderId - POS Order ID
 * @param itemId - Item ID to mark as served
 * @param servedAt - Date/time when item was served
 * Invalidates: specific order detail + pos-order-list
 */
export function useSetServedPOSOrderItem() {
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["pos-order-detail", variables.orderId],
      });
      queryClient.invalidateQueries({ queryKey: ["pos-order-list"] });
      toast.success("Đã đánh dấu món đã phục vụ");
    },
  });
}

/**
 * Get print data for a POS order (mutation version)
 * Fetches formatted receipt data for printing
 * @param orderId - POS Order ID
 * @returns Print-ready data for receipts/kitchen tickets
 * Note: This is a mutation wrapper for consistency, but doesn't modify data
 */
export function usePrintPOSOrder() {
  return useMutation({
    mutationFn: async (orderId: string) => {
      return await OrderService.getPOSOrderPrintData(orderId);
    },
  });
}

export function useUpdateScheduledTime() {
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["pos-order-detail", variables.orderId],
      });
      queryClient.invalidateQueries({ queryKey: ["pos-order-list"] });
      toast.success("Đã cập nhật thời gian phục vụ");
    },
  });
}

export function useMarkItemServed() {
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
  });
}

/**
 * Update note/comment for POS order
 * @param orderId - POS Order ID
 * @param note - Note text to save
 * Invalidates: specific order detail + pos-order-list
 */
export function useUpdatePOSOrderNote() {
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["pos-order-detail", variables.orderId],
      });
      queryClient.invalidateQueries({ queryKey: ["pos-order-list"] });
    },
  });
}
