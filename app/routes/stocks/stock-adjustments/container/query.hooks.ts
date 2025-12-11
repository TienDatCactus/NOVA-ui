import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StockAdjustmentsService } from "~/services/api/stocks/stock-adjustments";
import type { StockAdjustmentListParams } from "~/services/api/stocks/stock-adjustments/stock-adjustments.types";
import type {
  CreateStockAdjustmentDto,
  UpdateStockAdjustmentDto,
} from "~/services/api/stocks/stock-adjustments/dto";
import { toast } from "sonner";
import { AxiosError } from "axios";

/**
 * Hook lấy danh sách stock adjustments
 */
export function useStockAdjustmentList(params: StockAdjustmentListParams) {
  return useQuery({
    queryKey: ["stock-adjustments", params],
    queryFn: async () =>
      await StockAdjustmentsService.getStockAdjustmentList(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook lấy chi tiết 1 stock adjustment
 */
export function useStockAdjustmentDetail(id: string) {
  return useQuery({
    queryKey: ["stock-adjustment", id],
    queryFn: async () =>
      await StockAdjustmentsService.getStockAdjustmentDetail(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook tạo stock adjustment mới
 */
export function useCreateStockAdjustment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateStockAdjustmentDto) =>
      await StockAdjustmentsService.createStockAdjustment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock-adjustments"] });
      toast.success("Tạo phiếu điều chỉnh thành công");
    },
    onError: (error) => {
      if (error instanceof AxiosError)
        toast.error(
          error?.response?.data?.message || "Lỗi khi tạo phiếu điều chỉnh"
        );
    },
  });
}

/**
 * Hook cập nhật stock adjustment (chỉ khi chưa apply)
 */
export function useUpdateStockAdjustment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateStockAdjustmentDto;
    }) => await StockAdjustmentsService.updateStockAdjustment(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["stock-adjustments"] });
      queryClient.invalidateQueries({
        queryKey: ["stock-adjustment", variables.id],
      });
      toast.success("Cập nhật phiếu điều chỉnh thành công");
    },
    onError: (error) => {
      if (error instanceof AxiosError)
        toast.error(
          error?.response?.data?.message || "Lỗi khi cập nhật phiếu điều chỉnh"
        );
    },
  });
}

/**
 * Hook xóa stock adjustment (chỉ khi chưa apply)
 */
export function useDeleteStockAdjustment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) =>
      await StockAdjustmentsService.deleteStockAdjustment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock-adjustments"] });
      toast.success("Xóa phiếu điều chỉnh thành công");
    },
    onError: (error) => {
      if (error instanceof AxiosError)
        toast.error(
          error?.response?.data?.message || "Lỗi khi xóa phiếu điều chỉnh"
        );
    },
  });
}

/**
 * ⭐ Hook áp dụng stock adjustment (IRREVERSIBLE - Critical operation)
 */
export function useApplyStockAdjustment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) =>
      await StockAdjustmentsService.applyStockAdjustment(id),
    onSuccess: (_, id) => {
      // Invalidate both list and detail
      queryClient.invalidateQueries({ queryKey: ["stock-adjustments"] });
      queryClient.invalidateQueries({ queryKey: ["stock-adjustment", id] });
      // Also invalidate items list as inventory changed
      queryClient.invalidateQueries({ queryKey: ["stock-items"] });
      toast.success("Áp dụng phiếu điều chỉnh thành công");
    },
    onError: (error) => {
      if (error instanceof AxiosError)
        toast.error(
          error?.response?.data?.message || "Lỗi khi áp dụng phiếu điều chỉnh"
        );
    },
  });
}
