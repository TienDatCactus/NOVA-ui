import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BookingService } from "~/services/api/booking";
import type { StaffAddCompletedChargesRequestDto } from "~/services/api/booking/dto";
import { toast } from "sonner";
import type z from "zod";
import { OrderSchema } from "~/services/api/orders/order.schema";
import {
  useAddSingleItemToPOSOrder,
  useCancelPOSOrder,
  useCompletePOSOrder,
  useCreatePOSOrder,
  useDeleteItemFromPOSOrder,
} from "~/routes/orders/container/pos-orders/mutation.hooks";
import type { AddSingleItemToPOSOrderRequestDto } from "~/services/api/orders/dto";

type POSOrderFromBookingDetail = z.infer<
  typeof OrderSchema.POSOrderListByBookingResponseSchema
>;

interface UseBookingOrdersProps {
  bookingId: string;
  bookingRoomId?: string;
  ordersData?: POSOrderFromBookingDetail; // Data from booking detail
}

export function useBookingOrders({
  bookingId,
  bookingRoomId,
}: UseBookingOrdersProps) {
  const queryClient = useQueryClient();
  const { mutate: createOrder, isPending: isCreatingOrder } =
    useCreatePOSOrder();
  const { mutate: addItem, isPending: isAddingItem } =
    useAddSingleItemToPOSOrder();
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
    const item: AddSingleItemToPOSOrderRequestDto = {
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

  const { mutate: cancelOrder } = useCancelPOSOrder();
  const { mutate: completeOrder } = useCompletePOSOrder();

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
    cancelOrder,
    completeOrder,
  };
}
