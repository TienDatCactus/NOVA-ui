import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { OrderService } from "~/services/api/orders";

function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => OrderService.cancelPOSOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pos-order-list"] });
    },
  });
}
function useCompleteOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => OrderService.completePOSOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pos-order-list"] });
    },
  });
}

// Pay now mutation
function usePayNow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      data,
    }: {
      orderId: string;
      data: {
        paymentMethod: string;
        paidAmount: number;
        transactionReference: string;
      };
    }) => OrderService.payPOSOrderNow(orderId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pos-order-list"] });
    },
  });
}

// Print order
function usePrintOrder() {
  return useMutation({
    mutationFn: async (orderId: string) => {
      return await OrderService.getPOSOrderPrintData(orderId);
    },
  });
}
export { useCancelOrder, useCompleteOrder, usePayNow, usePrintOrder };
