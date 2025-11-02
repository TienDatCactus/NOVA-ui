import { useQuery } from "@tanstack/react-query";
import { MenuCategoryService } from "~/services/api/menu-category";
import type { MenuCategoryListParams } from "~/services/types/menu-category.types";

export function useMenuCategories(params?: MenuCategoryListParams) {
  return useQuery({
    queryKey: ["menu-categories", params],
    queryFn: async () =>
      await MenuCategoryService.getMenuCategoryList(params ?? {}),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
