import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { usePaymentRedirect } from "~/hooks/use-payment-redirect";
import { OrderService } from "~/services/api/orders";
import type {
  CreateServiceOrderRequestDto,
  ServiceOrderDetailDto,
  ServiceOrderPayNowRequestDto,
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
      queryClient.invalidateQueries({
        queryKey: ["service-order-list"],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["service-order-detail"],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["checkout", "pending-charges", data.bookingId],
        refetchType: "active",
      });
      toast.success("Đã tạo service order thành công");
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message || "Đã có lỗi xảy ra");
      }
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
    onError: (error) => {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message);
      }
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
    onError: (error) => {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message);
      }
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
    onError: (error) => {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message);
      }
    },
  });
}

/**
 * Pay service order now (mid-stay)
 */
export function usePayServiceOrderNow() {
  const queryClient = useQueryClient();
  const { handlePaymentResponse } = usePaymentRedirect();

  return useMutation({
    mutationFn: ({
      orderId,
      data,
    }: {
      orderId: string;
      data: ServiceOrderPayNowRequestDto;
    }) => OrderService.payServiceOrderNow(orderId, data),
    onSuccess: (response, variables) => {
      // Check if payment requires redirect (Card/BankTransfer)
      const redirected = handlePaymentResponse(response);

      if (redirected) {
        // User will be redirected to payment gateway
        // Success toast will be shown after callback
        return;
      }

      // Cash payment completed - invalidate queries and show success
      queryClient.invalidateQueries({
        queryKey: ["service-order-detail", variables.orderId],
      });
      queryClient.invalidateQueries({ queryKey: ["service-order-list"] });
      queryClient.invalidateQueries({
        queryKey: ["checkout", "pending-charges"],
      });
      toast.success("Đã thanh toán service order");
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message);
      }
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
      scheduledAt: string;
    }) => {
      return await OrderService.setScheduledServiceOrder(orderId, {
        scheduledAt,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["service-order-detail", variables.orderId],
      });
      queryClient.invalidateQueries({ queryKey: ["service-order-list"] });
      toast.success("Đã cập nhật thời gian phục vụ");
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message || "Đã có lỗi xảy ra");
      }
    },
  });
}
