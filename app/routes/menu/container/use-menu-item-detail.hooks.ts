import { useQuery } from "@tanstack/react-query";
import { MenuItemService } from "~/services/api/menu-item";

function useMenuItemDetail(id: string | null) {
  return useQuery({
    queryKey: ["menu-item-detail", id],
    queryFn: async () => {
      if (!id) throw new Error("Menu item ID is required");
      return await MenuItemService.getMenuItemDetail(id);
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
}

export default useMenuItemDetail;
