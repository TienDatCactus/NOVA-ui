import { useQuery } from "@tanstack/react-query";
import { MenuService } from "~/services/api/menu";

export function useMenuList() {
  return useQuery({
    queryKey: ["menu-list"],
    queryFn: async () => await MenuService.getMenuList(),
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

export function useMenuItemDetail(itemId: string) {
  return useQuery({
    queryKey: ["menu-item-detail", itemId],
    queryFn: async () => await MenuService.getMenuItemDetail(itemId),
    enabled: !!itemId,
  });
}
