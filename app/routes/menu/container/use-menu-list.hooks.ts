import { useQuery } from "@tanstack/react-query";
import { MenuItemService } from "~/services/api/menu-item";

function useMenuList() {
  return useQuery({
    queryKey: ["menu-list"],
    queryFn: async () => await MenuItemService.getMenuList(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
}

export default useMenuList;
