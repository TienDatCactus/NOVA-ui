import { useQuery } from "@tanstack/react-query";
import { MenuService } from "~/services/api/menu";
import type { MenuListParams } from "~/services/types/booking.types";

function useMenu(params?: MenuListParams) {
  return useQuery({
    queryKey: ["menu", params],
    queryFn: async () => await MenuService.getMenuList(params || {}),
  });
}

export default useMenu;
