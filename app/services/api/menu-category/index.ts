import http from "~/lib/http";
import { Menu } from "~/services/url";
import useMenuCategorySchema from "~/services/schema/menu-category.schema";
import type { MenuCategoryListParams } from "~/services/types/menu-category.types";
import type {
  CreateMenuCategoryRequestDto,
  CreateMenuCategoryResponseDto,
  MenuCategoryDetailDto,
  MenuCategoryListResponseDto,
  UpdateMenuCategoryRequestDto,
  UpdateMenuCategoryResponseDto,
} from "./dto";

const {
  MenuCategoryListResponseSchema,
  MenuCategoryDetailSchema,
  CreateMenuCategoryResponseSchema,
  UpdateMenuCategoryResponseSchema,
} = useMenuCategorySchema();

async function getMenuCategoryList(
  params?: MenuCategoryListParams
): Promise<MenuCategoryListResponseDto> {
  try {
    const resp = await http.get(Menu.list, { params });
    return MenuCategoryListResponseSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function getMenuCategoryDetail(
  id: string
): Promise<MenuCategoryDetailDto> {
  try {
    const resp = await http.get(Menu.detail(id));
    return MenuCategoryDetailSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function createMenuCategory(
  data: CreateMenuCategoryRequestDto
): Promise<CreateMenuCategoryResponseDto> {
  try {
    const resp = await http.post(Menu.create, data);
    return CreateMenuCategoryResponseSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function updateMenuCategory(
  id: string,
  data: UpdateMenuCategoryRequestDto
): Promise<UpdateMenuCategoryResponseDto> {
  try {
    const resp = await http.put(Menu.update(id), data);
    // Backend might return the updated item or just success message
    // If no data returned, fetch the updated item
    if (!resp.data || typeof resp.data !== 'object') {
      return getMenuCategoryDetail(id);
    }
    return UpdateMenuCategoryResponseSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function deleteMenuCategory(id: string): Promise<void> {
  try {
    await http.delete(Menu.delete(id));
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

export const MenuCategoryService = {
  getMenuCategoryList,
  getMenuCategoryDetail,
  createMenuCategory,
  updateMenuCategory,
  deleteMenuCategory,
};
