import http from "~/lib/http";
import { MenuItem } from "~/services/url";
import useMenuSchema from "~/services/schema/menu.schema";
import type {
  MenuListResponseDto,
  MenuItemDetailDto,
  CreateMenuItemRequestDto,
  CreateMenuItemResponseDto,
  UpdateMenuItemRequestDto,
  UpdateMenuItemResponseDto,
} from "./dto";

const {
  MenuListResponseSchema,
  MenuItemDetailSchema,
  CreateMenuItemResponseSchema,
  UpdateMenuItemResponseSchema,
} = useMenuSchema();

async function getMenuList(): Promise<MenuListResponseDto> {
  try {
    const resp = await http.get(MenuItem.list);
    return MenuListResponseSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function getMenuItemDetail(id: string): Promise<MenuItemDetailDto> {
  try {
    const resp = await http.get(MenuItem.detail(id));
    return MenuItemDetailSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function createMenuItem(
  data: CreateMenuItemRequestDto
): Promise<CreateMenuItemResponseDto> {
  try {
    const resp = await http.post(MenuItem.create, data);
    return CreateMenuItemResponseSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function updateMenuItem(
  id: string,
  data: UpdateMenuItemRequestDto
): Promise<UpdateMenuItemResponseDto> {
  try {
    const resp = await http.put(MenuItem.update(id), data);
    // Backend might return the updated item or just success message
    // If no data returned, fetch the updated item
    if (!resp.data || typeof resp.data !== "object") {
      return getMenuItemDetail(id);
    }
    return UpdateMenuItemResponseSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function deleteMenuItem(id: string): Promise<void> {
  try {
    await http.delete(MenuItem.delete(id));
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

export const MenuItemService = {
  getMenuList,
  getMenuItemDetail,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
};
