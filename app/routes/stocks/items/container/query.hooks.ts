import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StockItemsService } from "~/services/api/stocks/items";
import type { ItemListParams } from "~/services/api/stocks/items/items.types";
import type {
  StockCreateItemDto,
  StockUpdateItemDto,
  StockAdjustRequestDto,
} from "~/services/api/stocks/items/dto";
import { toast } from "sonner";
import { AxiosError } from "axios";

/**
 * Hook lấy danh sách items với params
 */
export function useStockItemList(params: ItemListParams) {
  return useQuery({
    queryKey: ["stock-items", params],
    queryFn: async () => await StockItemsService.getStockItemList(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
export function useLowStockItems() {
  return useQuery({
    queryKey: ["low-stock-items"],
    queryFn: async () => await StockItemsService.getLowStockItems(),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook lấy chi tiết 1 item
 */
export function useStockItemDetail(
  id?: string,
  code?: string,
  options?: { enabled: boolean }
) {
  return useQuery({
    queryKey: ["stock-item", id, code],
    queryFn: async () => await StockItemsService.getStockItemDetail(id, code),
    enabled: !!options?.enabled && !!(id || code),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook lấy lịch sử giao dịch của item
 */
export function useStockItemTransactions(
  itemId: string,
  params?: ItemListParams
) {
  return useQuery({
    queryKey: ["stock-item-transactions", itemId, params],
    queryFn: async () =>
      await StockItemsService.getStockItemsTransactions(itemId, params),
    enabled: !!itemId,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook tạo item mới
 */
export function useCreateStockItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: StockCreateItemDto) =>
      await StockItemsService.createStockItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock-items"] });
      toast.success("Tạo hàng hóa thành công");
    },
    onError: (error) => {
      if (error instanceof AxiosError)
        toast.error(error?.response?.data.message || "Lỗi khi tạo hàng hóa");
    },
  });
}

export function useUpdateStockItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: StockUpdateItemDto;
    }) => await StockItemsService.updateStockItem(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["stock-items"] });
      queryClient.invalidateQueries({
        queryKey: ["stock-item", variables.id],
      });
      toast.success("Cập nhật hàng hóa thành công");
    },
    onError: (error) => {
      if (error instanceof AxiosError)
        toast.error(
          error?.response?.data.message || "Lỗi khi cập nhật hàng hóa"
        );
    },
  });
}

/**
 * Hook xóa item
 */
export function useDeleteStockItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) =>
      await StockItemsService.deleteStockItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock-items"] });
      toast.success("Xóa hàng hóa thành công");
    },
    onError: (error) => {
      if (error instanceof AxiosError)
        toast.error(error?.response?.data.message || "Lỗi khi xóa hàng hóa");
    },
  });
}

/**
 * Hook điều chỉnh kho nhanh (quick adjustment)
 */
export function useAdjustStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: StockAdjustRequestDto;
    }) => await StockItemsService.adjustStock(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["stock-items"] });
      queryClient.invalidateQueries({
        queryKey: ["stock-item", variables.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["stock-item-transactions", variables.id],
      });
      toast.success("Điều chỉnh kho thành công");
    },
    onError: (error) => {
      if (error instanceof AxiosError)
        toast.error(error?.response?.data.message || "Lỗi khi điều chỉnh kho");
    },
  });
}
