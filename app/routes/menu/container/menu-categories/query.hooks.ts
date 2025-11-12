import { useQuery } from "@tanstack/react-query";
import { MenuCategoryService } from "~/services/api/menu-category";
import type { MenuCategoryListParams } from "~/services/api/menu-category/menu-category.types";

/**
 * Hook để lấy danh sách menu categories
 */
export function useMenuCategories(
  params?: MenuCategoryListParams,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ["menu-category-list", params],
    queryFn: async () =>
      await MenuCategoryService.getMenuCategoryList(params ?? {}),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled,
  });
}

/**
 * Hook để lấy chi tiết một menu category
 * @param categoryId - ID của category cần lấy detail
 */
export function useMenuCategoryDetail(
  categoryId: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["menu-category-detail", categoryId],
    queryFn: async () =>
      await MenuCategoryService.getMenuCategoryDetail(categoryId),
    enabled: !!categoryId && options?.enabled,
    staleTime: 2 * 60 * 1000,
  });
}
