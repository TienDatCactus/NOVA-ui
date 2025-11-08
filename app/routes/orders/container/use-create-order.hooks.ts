import { useMutation } from "@tanstack/react-query";
import { OrderService } from "~/services/api/orders";
import type { PosCartItem } from "~/store/pos-order.store";
import { toast } from "sonner";

type CreateOrderParams = {
  bookingId?: string | null;
  bookingRoomId?: string | null;
  items: PosCartItem[];
};

/**
 * Hook to create POS order and add items
 */
export function useCreatePosOrder() {
  return useMutation({
    mutationFn: async ({
      bookingId,
      bookingRoomId,
      items,
    }: CreateOrderParams) => {
      const order = await OrderService.createPOSOrder({
        bookingId: bookingId || undefined,
        bookingRoomId: bookingRoomId || undefined,
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
