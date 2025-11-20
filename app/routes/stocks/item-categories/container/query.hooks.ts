import { useQuery } from "@tanstack/react-query";
import { ItemCategoryService } from "~/services/api/stocks/item-category";
import type { ItemCategoryListParams } from "~/services/api/stocks/item-category/item-category.types";

export function useItemCategories(params: ItemCategoryListParams = {}) {
  return useQuery({
    queryKey: ["item-categories", params],
    queryFn: async () => await ItemCategoryService.getItemCategoryList(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
