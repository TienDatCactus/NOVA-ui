import {
  useCreatePOSOrder,
  useAddItemToPOSOrder,
  useDeleteItemFromPOSOrder,
} from "~/routes/orders/container/order-pos/mutation.hooks";
import {
  usePOSOrderDetailByBooking,
  usePOSOrderList,
} from "~/routes/orders/container/order-pos/query.hooks";
import type { AddItemsToPOSOrderRequestDto } from "~/services/api/orders/dto";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BookingService } from "~/services/api/booking";
import type { StaffAddCompletedChargesRequestDto } from "~/services/api/booking/dto";
import { toast } from "sonner";

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

  /**
   * Add completed charges (POS items) to booking
   * Creates a new POS order with status = Completed
   */
  const queryClient = useQueryClient();
  const { mutate: addCompletedCharges, isPending: isAddingCompletedCharges } =
    useMutation({
      mutationFn: async ({
        bookingId,
        data,
      }: {
        bookingId: string;
        data: StaffAddCompletedChargesRequestDto;
      }) => {
        return await BookingService.staffAddCompletedCharges(bookingId, data);
      },
      onSuccess: () => {
        toast.success("Đã thêm món hoàn thành thành công");
        refetchOrder();
        queryClient.invalidateQueries({
          queryKey: ["booking-pending-charges", bookingId],
        });
      },
      onError: (error: any) => {
        console.error("Error adding completed charges:", error);
        toast.error(error.message || "Không thể thêm món. Vui lòng thử lại.");
      },
    });

  const handleAddCompletedCharges = (
    posItems: Array<{ menuItemId: string; quantity: number }>,
    bookingRoomId?: string | null
  ) => {
    const data: StaffAddCompletedChargesRequestDto = {
      posItems,
      bookingRoomId: bookingRoomId || undefined,
    };

    addCompletedCharges({
      bookingId,
      data,
    });
  };

  return {
    // State
    ordersList,
    hasOrder: !!ordersList,

    isCreatingOrder,
    isAddingItem,
    isDeletingItem,
    isLoadingOrder,
    isAddingCompletedCharges,

    createBookingOrder: handleCreateBookingOrder,
    createRoomOrder: handleCreateRoomOrder,
    addMenuItem: handleAddMenuItem,
    removeItem: handleRemoveItem,
    addCompletedCharges: handleAddCompletedCharges,
  };
}
