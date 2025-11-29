import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PurchaseRequestsService } from "~/services/api/stocks/purchase-requests";
import type { PurchaseRequestListParams } from "~/services/api/stocks/purchase-requests/purchase-requests.types";
import type {
  CreatePurchaseRequestDto,
  UpdatePurchaseRequestDto,
  ReceiveStockRequestDto,
} from "~/services/api/stocks/purchase-requests/dto";
import { toast } from "sonner";

/**
 * Hook lấy danh sách purchase requests với params
 */
export function usePurchaseRequestList(params: PurchaseRequestListParams) {
  return useQuery({
    queryKey: ["purchase-requests", params],
    queryFn: async () =>
      await PurchaseRequestsService.getPurchaseRequestList(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook lấy chi tiết 1 purchase request
 */
export function usePurchaseRequestDetail(id: string) {
  return useQuery({
    queryKey: ["purchase-request", id],
    queryFn: async () =>
      await PurchaseRequestsService.getPurchaseRequestDetail(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook tạo purchase request mới
 */
export function useCreatePurchaseRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePurchaseRequestDto) =>
      await PurchaseRequestsService.createPurchaseRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-requests"] });
      toast.success("Tạo yêu cầu mua hàng thành công");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Lỗi khi tạo yêu cầu mua hàng");
    },
  });
}

/**
 * Hook cập nhật purchase request
 */
export function useUpdatePurchaseRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdatePurchaseRequestDto;
    }) => await PurchaseRequestsService.updatePurchaseRequest(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["purchase-requests"] });
      queryClient.invalidateQueries({
        queryKey: ["purchase-request", variables.id],
      });
      toast.success("Cập nhật yêu cầu mua hàng thành công");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Lỗi khi cập nhật yêu cầu mua hàng");
    },
  });
}

/**
 * Hook xóa purchase request
 */
export function useDeletePurchaseRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) =>
      await PurchaseRequestsService.deletePurchaseRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-requests"] });
      toast.success("Xóa yêu cầu mua hàng thành công");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Lỗi khi xóa yêu cầu mua hàng");
    },
  });
}

/**
 * Hook phê duyệt purchase request
 */
export function useApprovePurchaseRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) =>
      await PurchaseRequestsService.approvePurchaseRequest(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["purchase-requests"] });
      queryClient.invalidateQueries({ queryKey: ["purchase-request", id] });
      toast.success("Phê duyệt yêu cầu mua hàng thành công");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Lỗi khi phê duyệt yêu cầu mua hàng");
    },
  });
}

/**
 * Hook từ chối purchase request
 */
export function useRejectPurchaseRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) =>
      await PurchaseRequestsService.rejectPurchaseRequest(id, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["purchase-requests"] });
      queryClient.invalidateQueries({
        queryKey: ["purchase-request", variables.id],
      });
      toast.success("Từ chối yêu cầu mua hàng thành công");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Lỗi khi từ chối yêu cầu mua hàng");
    },
  });
}

/**
 * Hook hủy purchase request
 */
export function useCancelPurchaseRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) =>
      await PurchaseRequestsService.cancelPurchaseRequest(id, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["purchase-requests"] });
      queryClient.invalidateQueries({
        queryKey: ["purchase-request", variables.id],
      });
      toast.success("Hủy yêu cầu mua hàng thành công");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Lỗi khi hủy yêu cầu mua hàng");
    },
  });
}

/**
 * Hook nhận hàng vào kho
 */
export function useReceiveStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      purchaseRequestId,
      data,
    }: {
      purchaseRequestId: string;
      data: ReceiveStockRequestDto;
    }) => await PurchaseRequestsService.receiveStock(purchaseRequestId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["purchase-requests"] });
      queryClient.invalidateQueries({
        queryKey: ["purchase-request", variables.purchaseRequestId],
      });
      queryClient.invalidateQueries({ queryKey: ["stock-items"] });
      toast.success("Nhận hàng vào kho thành công");
    },
    onError: (error: any) => {
      console.log(error);
      toast.error(error?.message || "Lỗi khi nhận hàng vào kho");
    },
  });
}
