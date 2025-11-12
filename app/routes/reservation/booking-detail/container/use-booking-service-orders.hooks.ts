import { useMutation, useQueryClient } from "@tanstack/react-query";
import { OrderService } from "~/services/api/orders";
import type {
  CreateServiceOrderRequestDto,
  UpdateServiceOrderRequestDto,
} from "~/services/api/orders/dto";
import { toast } from "sonner";

interface UseBookingServiceOrdersProps {
  bookingId: string;
  bookingRoomId?: string;
}

export function useBookingServiceOrders({
  bookingId,
  bookingRoomId,
}: UseBookingServiceOrdersProps) {
  const queryClient = useQueryClient();

  /**
   * Create a new service order for booking
   */
  const { mutate: createServiceOrder, isPending: isCreatingServiceOrder } =
    useMutation({
      mutationFn: async (data: CreateServiceOrderRequestDto) => {
        return await OrderService.createServiceOrder(data);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["bookings-detail"],
        });
        toast.success("Tạo dịch vụ thành công");
      },
      onError: () => {
        toast.error("Không thể tạo dịch vụ");
      },
    });

  /**
   * Update service order
   */
  const { mutate: updateServiceOrder, isPending: isUpdatingServiceOrder } =
    useMutation({
      mutationFn: async ({
        orderId,
        data,
      }: {
        orderId: string;
        data: UpdateServiceOrderRequestDto;
      }) => {
        return await OrderService.updateServiceOrder(orderId, data);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["bookings-detail"],
        });
        toast.success("Cập nhật dịch vụ thành công");
      },
      onError: () => {
        toast.error("Không thể cập nhật dịch vụ");
      },
    });

  /**
   * Complete service order
   */
  const { mutate: completeServiceOrder, isPending: isCompletingServiceOrder } =
    useMutation({
      mutationFn: async (orderId: string) => {
        return await OrderService.completeServiceOrder(orderId);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["bookings-detail"],
        });
        queryClient.invalidateQueries({
          queryKey: ["booking-pending-charges", bookingId],
        });
        toast.success("Hoàn thành dịch vụ");
      },
      onError: () => {
        toast.error("Không thể hoàn thành dịch vụ");
      },
    });

  /**
   * Cancel service order
   */
  const { mutate: cancelServiceOrder, isPending: isCancellingServiceOrder } =
    useMutation({
      mutationFn: async (orderId: string) => {
        return await OrderService.cancelServiceOrder(orderId);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["bookings-detail"],
        });
        queryClient.invalidateQueries({
          queryKey: ["booking-pending-charges", bookingId],
        });
        toast.success("Đã hủy dịch vụ");
      },
      onError: () => {
        toast.error("Không thể hủy dịch vụ");
      },
    });

  const handleCreateBookingServiceOrder = (
    serviceItemId: string,
    quantity: number,
    unitPrice: number,
    scheduledAt?: string,
    note?: string
  ) => {
    const data: CreateServiceOrderRequestDto = {
      bookingId: bookingId || null,
      bookingRoomId: bookingRoomId || null,
      serviceItemId,
      quantity,
      unitPrice,
      scheduledAt: scheduledAt || null,
      note: note || null,
    };

    createServiceOrder(data);
  };

  const handleCreateRoomServiceOrder = (
    serviceItemId: string,
    quantity: number,
    unitPrice: number,
    scheduledAt?: string,
    note?: string
  ) => {
    const data: CreateServiceOrderRequestDto = {
      bookingId: bookingId || null,
      bookingRoomId: bookingRoomId || null,
      serviceItemId,
      quantity,
      unitPrice,
      scheduledAt: scheduledAt || null,
      note: note || null,
    };

    createServiceOrder(data);
  };

  const handleCompleteServiceOrder = (orderId: string) => {
    completeServiceOrder(orderId);
  };

  const handleCancelServiceOrder = (orderId: string) => {
    cancelServiceOrder(orderId);
  };

  return {
    // State
    isCreatingServiceOrder,
    isUpdatingServiceOrder,
    isCompletingServiceOrder,
    isCancellingServiceOrder,
    isLoadingServiceOrder: false,

    // Actions
    createBookingServiceOrder: handleCreateBookingServiceOrder,
    createRoomServiceOrder: handleCreateRoomServiceOrder,
    updateServiceOrder,
    completeServiceOrder: handleCompleteServiceOrder,
    cancelServiceOrder: handleCancelServiceOrder,
  };
}
