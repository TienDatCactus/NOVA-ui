import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MenuCategoryService } from "~/services/api/menu-category";
import type {
  CreateMenuCategoryRequestDto,
  UpdateMenuCategoryRequestDto,
} from "~/services/api/menu-category/dto";

/**
 * Hook để tạo menu category mới
 */
export function useCreateMenuCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateMenuCategoryRequestDto) =>
      await MenuCategoryService.createMenuCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-category-list"] });
      toast.success("Tạo danh mục thực đơn thành công");
    },
  });
}

/**
 * Hook để cập nhật menu category
 * @param categoryId - ID của category cần cập nhật
 */
export function useUpdateMenuCategory(categoryId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateMenuCategoryRequestDto) =>
      await MenuCategoryService.updateMenuCategory(categoryId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-category-list"] });
      queryClient.invalidateQueries({
        queryKey: ["menu-category-detail", categoryId],
      });
      toast.success("Cập nhật danh mục thực đơn thành công");
    },
  });
}

/**
 * Hook để xóa menu category
 */
export function useDeleteMenuCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryId: string) =>
      await MenuCategoryService.deleteMenuCategory(categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-category-list"] });
      toast.success("Xóa danh mục thực đơn thành công");
    },
  });
}
