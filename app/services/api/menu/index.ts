import type { MenuListResponseDto } from "./dto";
import { Menu } from "~/services/url";
import http from "~/lib/http";
import useMenuSchema from "~/services/schema/menu.schema";
import type { MenuListParams } from "~/services/types/menu.types";
const { MenuListResponseSchema } = useMenuSchema();

async function getMenuList(
  params: MenuListParams
): Promise<MenuListResponseDto> {
  try {
    const resp = await http.get(Menu.list, { params });
    return MenuListResponseSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

export const MenuService = {
  getMenuList,
};
