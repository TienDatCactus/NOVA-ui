import { useQuery } from "@tanstack/react-query";
import { MenuItemService } from "~/services/api/menu-item";

function useMenu() {
  return useQuery({
    queryKey: ["menu"],
    queryFn: async () => await MenuItemService.getMenuList(),
  });
}

export default useMenu;
