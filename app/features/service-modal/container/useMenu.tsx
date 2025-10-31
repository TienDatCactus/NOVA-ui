import { useQuery } from "@tanstack/react-query";
<<<<<<< Updated upstream
import { MenuService } from "~/services/api/menu";
import type { MenuListParams } from "~/services/types/menu.types";

function useMenu(params?: MenuListParams) {
  return useQuery({
    queryKey: ["menu", params],
    queryFn: async () => await MenuService.getMenuList(params || {}),
=======
import { MenuItemService } from "~/services/api/menu-item";

function useMenu() {
  return useQuery({
    queryKey: ["menu"],
    queryFn: async () => await MenuItemService.getMenuList(),
>>>>>>> Stashed changes
  });
}

export default useMenu;
