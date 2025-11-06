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

export function useBookingOrders({
  bookingId,
  bookingRoomId,
}: UseBookingOrdersProps) {
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);

  const { mutate: createOrder, isPending: isCreatingOrder } =
    useCreatePOSOrder();
  const { mutate: addItem, isPending: isAddingItem } = useAddItemToPOSOrder();
  const { mutate: deleteItem, isPending: isDeletingItem } =
    useDeleteItemFromPOSOrder();

  const {
    data: orderDetail,
    isPending: isLoadingOrder,
    refetch: refetchOrder,
  } = usePOSOrderDetail(currentOrderId || "", !!currentOrderId);

  const handleCreateBookingOrder = () => {
    createOrder(
      {
        bookingId: bookingId || null,
        bookingRoomId: null, // No specific room - order belongs to booking
      },
      {
        onSuccess: (data) => {
          setCurrentOrderId(data.posOrderId);
        },
      }
    );
  };

  const handleCreateRoomOrder = () => {
    createOrder(
      {
        bookingId: bookingId || null,
        bookingRoomId: bookingRoomId || null, // Specific room
      },
      {
        onSuccess: (data) => {
          setCurrentOrderId(data.posOrderId);
        },
      }
    );
  };

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

    createBookingOrder: handleCreateBookingOrder,
    createRoomOrder: handleCreateRoomOrder,
    addMenuItem: handleAddMenuItem,
    removeItem: handleRemoveItem,
  };
}
