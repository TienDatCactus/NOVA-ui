import {
  useCreatePOSOrder,
  useAddItemToPOSOrder,
  useDeleteItemFromPOSOrder,
} from "~/routes/orders/container/order-pos/mutation.hooks";
import type { AddItemsToPOSOrderRequestDto } from "~/services/api/orders/dto";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BookingService } from "~/services/api/booking";
import type { StaffAddCompletedChargesRequestDto } from "~/services/api/booking/dto";
import { toast } from "sonner";
import type z from "zod";
import { OrderSchema } from "~/services/api/orders/order.schema";

type POSOrderFromBookingDetail = z.infer<
  typeof OrderSchema.POSOrdersListItemByBookingDetailSchema
>;

interface UseBookingOrdersProps {
  bookingId: string;
  bookingRoomId?: string;
  ordersData?: POSOrderFromBookingDetail[]; // Data from booking detail
}

export function useBookingOrders({
  bookingId,
  bookingRoomId,
}: UseBookingOrdersProps) {
  const queryClient = useQueryClient();
  const { mutate: createOrder, isPending: isCreatingOrder } =
    useCreatePOSOrder();
  const { mutate: addItem, isPending: isAddingItem } = useAddItemToPOSOrder();
  const { mutate: deleteItem, isPending: isDeletingItem } =
    useDeleteItemFromPOSOrder();

  const handleCreateBookingOrder = () => {
    createOrder(
      {
        bookingId: bookingId || null,
        bookingRoomId: bookingRoomId || null,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["bookings-detail"],
          });
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
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["bookings-detail"],
          });
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
          queryClient.invalidateQueries({
            queryKey: ["bookings-detail"],
          });
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
          queryClient.invalidateQueries({
            queryKey: ["bookings-detail"],
          });
        },
      }
    );
  };

  /**
   * Add completed charges (POS items) to booking
   * Creates a new POS order with status = Completed
   */
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
        queryClient.invalidateQueries({
          queryKey: ["bookings-detail"],
        });
        queryClient.invalidateQueries({
          queryKey: ["booking-pending-charges", bookingId],
        });
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

    isCreatingOrder,
    isAddingItem,
    isDeletingItem,
    isLoadingOrder: false, // No longer loading from separate API call
    isAddingCompletedCharges,

    createBookingOrder: handleCreateBookingOrder,
    createRoomOrder: handleCreateRoomOrder,
    addMenuItem: handleAddMenuItem,
    removeItem: handleRemoveItem,
    addCompletedCharges: handleAddCompletedCharges,
  };
}
