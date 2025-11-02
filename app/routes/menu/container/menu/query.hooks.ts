import { useQuery } from "@tanstack/react-query";
import { MenuService } from "~/services/api/menu";
import type { MenuListParams } from "~/services/types/menu.types";

export function useMenuList(params?: MenuListParams) {
  return useQuery({
    queryKey: ["menu-list", params],
    queryFn: async () => await MenuService.getMenuList(params ?? {}),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useMenuListByCategory(categoryId: string) {
  return useQuery({
    queryKey: ["menu-list-by-category", categoryId],
    queryFn: async () => await MenuService.getMenuListByCategory(categoryId),
    enabled: !!categoryId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useMenuItemDetail(
  itemId: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["menu-item-detail", itemId],
    queryFn: async () => await MenuService.getMenuItemDetail(itemId),
    enabled: options?.enabled ?? !!itemId,
    staleTime: 2 * 60 * 1000,
  });
}
