import {
  useCreatePOSOrder,
  useAddItemToPOSOrder,
  useDeleteItemFromPOSOrder,
} from "~/routes/pos-orders/container/mutation.hooks";

import { usePOSOrderDetailByBooking } from "~/routes/pos-orders/container/query.hooks";
import type { AddItemsToPOSOrderRequestDto } from "~/services/api/orders/dto";

interface UseBookingOrdersProps {
  bookingId: string;
  bookingRoomId?: string;
}

export function useBookingOrders({
  bookingId,
  bookingRoomId,
}: UseBookingOrdersProps) {
  const { mutate: createOrder, isPending: isCreatingOrder } =
    useCreatePOSOrder();
  const { mutate: addItem, isPending: isAddingItem } = useAddItemToPOSOrder();
  const { mutate: deleteItem, isPending: isDeletingItem } =
    useDeleteItemFromPOSOrder();

  const {
    data: ordersList,
    isPending: isLoadingOrder,
    refetch: refetchOrder,
  } = usePOSOrderDetailByBooking(bookingId, bookingRoomId, !!bookingId);

  const handleCreateBookingOrder = () => {
    createOrder(
      {
        bookingId: bookingId || null,
        bookingRoomId: null, // No specific room - order belongs to booking
      },
      {
        onSuccess: () => {
          refetchOrder();
        },
      }
    );
  };

  const handleCreateRoomOrder = () => {
    console.log(bookingId, bookingRoomId);
    createOrder(
      {
        bookingId: bookingId || null,
        bookingRoomId: bookingRoomId || null, // Specific room
      },
      {
        onSuccess: () => {
          refetchOrder();
        },
      }
    );
  };

  const handleAddMenuItem = (
    orderId: string,
    menuItemId: string,
    quantity: number,
    unitPrice: number
  ) => {
    const item: AddItemsToPOSOrderRequestDto = {
      menuItemId,
      quantity,
      unitPrice,
    };

    addItem(
      {
        orderId,
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
  const handleRemoveItem = (orderId: string, itemId: string) => {
    deleteItem(
      {
        orderId,
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
    ordersList,
    hasOrder: !!ordersList,

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
