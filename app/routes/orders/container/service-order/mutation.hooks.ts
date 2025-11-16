import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { OrderService } from "~/services/api/orders";
import type {
  CreateServiceOrderRequestDto,
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-order-list"] });
      toast.success("Tạo service order thành công");
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-order-list"] });
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
      queryClient.invalidateQueries({
        queryKey: ["service-order-detail", orderId],
      });
      queryClient.invalidateQueries({ queryKey: ["service-order-list"] });
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
      queryClient.invalidateQueries({
        queryKey: ["service-order-detail", orderId],
      });
      queryClient.invalidateQueries({ queryKey: ["service-order-list"] });
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
      queryClient.invalidateQueries({
        queryKey: ["service-order-detail", variables.orderId],
      });
      queryClient.invalidateQueries({ queryKey: ["service-order-list"] });
    },
  });
}

/**
 * Create service order with items (for Service POS)
 * Similar to menu POS but creates service orders instead
 */
