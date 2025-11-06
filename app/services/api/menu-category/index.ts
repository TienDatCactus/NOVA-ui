import http from "~/lib/http";
import { MenuCategory } from "~/services/url";
import { MenuCategorySchema } from "~/services/api/menu-category/menu-category.schema";
import type {
  MenuCategoryListResponseDto,
  MenuCategoryDetailDto,
  CreateMenuCategoryRequestDto,
  CreateMenuCategoryResponseDto,
  UpdateMenuCategoryRequestDto,
  UpdateMenuCategoryResponseDto,
} from "./dto";
import type { MenuCategoryListParams } from "~/services/api/menu-category/menu-category.types";

const {
  MenuCategoryListResponseSchema,
  MenuCategoryItemSchema,
  CreateMenuCategoryResponseSchema,
} = MenuCategorySchema;

/**
 * Get list of all menu categories
 */
async function getMenuCategoryList(
  params: MenuCategoryListParams
): Promise<MenuCategoryListResponseDto> {
  try {
    const resp = await http.get(MenuCategory.list, { params });
    return MenuCategoryListResponseSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

/**
 * Get menu category details by ID
 */
async function getMenuCategoryDetail(
  categoryId: string
): Promise<MenuCategoryDetailDto> {
  try {
    const resp = await http.get(MenuCategory.detail(categoryId));
    return MenuCategoryItemSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

/**
 * Create a new menu category
 */
async function createMenuCategory(
  data: CreateMenuCategoryRequestDto
): Promise<CreateMenuCategoryResponseDto> {
  try {
    const resp = await http.post(MenuCategory.create, data);
    return CreateMenuCategoryResponseSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

/**
 * Update an existing menu category
 */
async function updateMenuCategory(
  categoryId: string,
  data: UpdateMenuCategoryRequestDto
): Promise<UpdateMenuCategoryResponseDto> {
  try {
    const resp = await http.put(MenuCategory.update(categoryId), data);
    return resp.data;
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

/**
 * Delete a menu category by ID
 */
async function deleteMenuCategory(categoryId: string): Promise<void> {
  try {
    await http.delete(MenuCategory.delete(categoryId));
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
