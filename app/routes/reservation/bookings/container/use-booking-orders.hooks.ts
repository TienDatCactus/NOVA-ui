import { useState } from "react";
import {
  useCreatePOSOrder,
  useAddItemToPOSOrder,
  useDeleteItemFromPOSOrder,
} from "~/routes/pos-orders/container/pos-orders-mutation.hooks";
import { usePOSOrderDetail } from "~/routes/pos-orders/container/pos-orders-query.hooks";
import type { AddItemsToPOSOrderRequestDto } from "~/services/api/orders/dto";

interface UseBookingOrdersProps {
  bookingId?: string;
  bookingRoomId?: string;
}

/**
 * Container hook for managing POS orders in booking detail
 * Handles creating orders, adding/removing menu items
 */
export function useBookingOrders({
  bookingId,
  bookingRoomId,
}: UseBookingOrdersProps) {
  // Track the current POS order ID
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);

  // Mutations
  const { mutate: createOrder, isPending: isCreatingOrder } =
    useCreatePOSOrder();
  const { mutate: addItem, isPending: isAddingItem } = useAddItemToPOSOrder();
  const { mutate: deleteItem, isPending: isDeletingItem } =
    useDeleteItemFromPOSOrder();

  // Query for order details (only if we have an order ID)
  const {
    data: orderDetail,
    isPending: isLoadingOrder,
    refetch: refetchOrder,
  } = usePOSOrderDetail(currentOrderId || "", !!currentOrderId);

  /**
   * Create a new POS order for this booking
   */
  const handleCreateOrder = () => {
    createOrder(
      {
        bookingId: bookingId || null,
        bookingRoomId: bookingRoomId || null,
      },
      {
        onSuccess: (data) => {
          setCurrentOrderId(data.posOrderId);
        },
      }
    );
  };

  /**
   * Add a menu item to the current order
   */
  const handleAddMenuItem = (item: AddItemsToPOSOrderRequestDto) => {
    if (!currentOrderId) return;

    addItem(
      {
        orderId: currentOrderId,
        data: item,
      },
      {
        onSuccess: () => {
          refetchOrder();
        },
      }
    );
  };

  /**
   * Remove an item from the order
   */
  const handleRemoveItem = (itemId: string) => {
    if (!currentOrderId) return;

    deleteItem(
      {
        orderId: currentOrderId,
        itemId,
      },
      {
        onSuccess: () => {
          refetchOrder();
        },
      }
    );
  };

  return {
    // State
    currentOrderId,
    orderDetail,
    hasOrder: !!currentOrderId,

    // Loading states
    isCreatingOrder,
    isAddingItem,
    isDeletingItem,
    isLoadingOrder,

    // Actions
    createOrder: handleCreateOrder,
    addMenuItem: handleAddMenuItem,
    removeItem: handleRemoveItem,
  };
}
