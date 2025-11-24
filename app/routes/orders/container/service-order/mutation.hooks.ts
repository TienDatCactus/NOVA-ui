import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { OrderService } from "~/services/api/orders";
import type {
  CreateServiceOrderRequestDto,
  ServiceOrderDetailDto,
  ServiceOrderPayNowRequestDto,
  SetScheduledServiceOrderRequestDto,
  UpdateServiceOrderRequestDto,
} from "~/services/api/orders/dto";

/**
 * Create new service order
 */
export function useCreateServiceOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateServiceOrderRequestDto) =>
      OrderService.createServiceOrder(data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ["service-order-list"] });
      queryClient.invalidateQueries({ queryKey: ["service-order-detail"] });
      queryClient.invalidateQueries({
        queryKey: ["checkout", "pending-charges", data.bookingId],
      });
      toast.success("Đã tạo service order thành công");
    },
  });
}

/**
 * Update service order
 */
export function useUpdateServiceOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      data,
    }: {
      orderId: string;
      data: UpdateServiceOrderRequestDto;
    }) => OrderService.updateServiceOrder(orderId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["service-order-list"] });
      queryClient.invalidateQueries({
        queryKey: ["service-order-detail", variables.orderId],
      });
      queryClient.invalidateQueries({
        queryKey: ["checkout", "pending-charges"],
      });
      toast.success("Đã cập nhật service order");
    },
  });
}

/**
 * Complete service order
 */
export function useCompleteServiceOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => OrderService.completeServiceOrder(orderId),
    onSuccess: (_, orderId) => {
      // Optimistically update detail status for immediate UI feedback
      queryClient.setQueryData(
        ["service-order-detail", orderId],
        (prev: ServiceOrderDetailDto | undefined) =>
          prev ? { ...prev, status: "Completed" } : prev
      );
      queryClient.invalidateQueries({
        queryKey: ["service-order-detail", orderId],
      });
      queryClient.invalidateQueries({ queryKey: ["service-order-list"] });
      queryClient.invalidateQueries({
        queryKey: ["checkout", "pending-charges"],
      });
      toast.success("Đã hoàn thành service order");
    },
  });
}

/**
 * Cancel service order
 */
export function useCancelServiceOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => OrderService.cancelServiceOrder(orderId),
    onSuccess: (_, orderId) => {
      // Optimistically update detail status for immediate UI feedback
      queryClient.setQueryData(
        ["service-order-detail", orderId],
        (prev: ServiceOrderDetailDto | undefined) =>
          prev ? { ...prev, status: "Cancelled" } : prev
      );
      queryClient.invalidateQueries({
        queryKey: ["service-order-detail", orderId],
      });
      queryClient.invalidateQueries({ queryKey: ["service-order-list"] });
      queryClient.invalidateQueries({
        queryKey: ["checkout", "pending-charges"],
      });
      toast.success("Đã hủy service order");
    },
  });
}

/**
 * Pay service order now (mid-stay)
 */
export function usePayServiceOrderNow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      data,
    }: {
      orderId: string;
      data: ServiceOrderPayNowRequestDto;
    }) => OrderService.payServiceOrderNow(orderId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["service-order-detail", variables.orderId],
      });
      queryClient.invalidateQueries({ queryKey: ["service-order-list"] });
      queryClient.invalidateQueries({
        queryKey: ["checkout", "pending-charges"],
      });
      toast.success("Đã thanh toán service order");
    },
  });
}

/**
 * Update scheduled time
 */
export function useUpdateServiceOrderSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      scheduledAt,
    }: {
      orderId: string;
      scheduledAt: Date;
    }) => {
      return await OrderService.setScheduledServiceOrder(orderId, {
        scheduledAt: scheduledAt.toISOString(),
      });
    },
    onSuccess: (_, variables) => {
      // Optimistically update scheduledAt in detail cache
      queryClient.setQueryData(
        ["service-order-detail", variables.orderId],
        (prev: ServiceOrderDetailDto | undefined) =>
          prev
            ? { ...prev, scheduledAt: variables.scheduledAt.toISOString() }
            : prev
      );
      queryClient.invalidateQueries({
        queryKey: ["service-order-detail", variables.orderId],
      });
      queryClient.invalidateQueries({ queryKey: ["service-order-list"] });
      toast.success("Đã cập nhật thời gian phục vụ");
    },
  });
}
