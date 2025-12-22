import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ItemCategoryService } from "~/services/api/stocks/item-category";
import type {
  CreateItemCategoryDto,
  UpdateItemCategoryDto,
} from "~/services/api/stocks/item-category/dto";
import type { ItemCategoryListParams } from "~/services/api/stocks/item-category/item-category.types";

export function useItemCategories(params: ItemCategoryListParams = {}) {
  return useQuery({
    queryKey: ["item-categories", params],
    queryFn: async () => await ItemCategoryService.getItemCategoryList(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useItemCategoryDetail(
  id: string,
  options: {
    enabled: boolean;
  }
) {
  return useQuery({
    queryKey: ["item-category", id],
    queryFn: async () => await ItemCategoryService.getItemCategoryDetail(id),
    enabled: !!options?.enabled && !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateItemCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateItemCategoryDto) =>
      await ItemCategoryService.createItemCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["item-categories"] });
      toast.success("Tạo danh mục hàng hóa thành công");
    },
  });
}

export function useUpdateItemCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateItemCategoryDto;
    }) => await ItemCategoryService.updateItemCategory(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["item-categories"] });
      queryClient.invalidateQueries({
        queryKey: ["item-category", variables.id],
      });
      toast.success("Cập nhật danh mục hàng hóa thành công");
    },
  });
}

export function useDeleteItemCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) =>
      await ItemCategoryService.deleteItemCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["item-categories"] });
      toast.success("Xóa danh mục hàng hóa thành công");
    },
  });
}
