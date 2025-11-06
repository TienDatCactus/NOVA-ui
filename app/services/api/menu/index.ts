import http from "~/lib/http";
import { Menu } from "~/services/url";
import { MenuSchema } from "~/services/api/menu/menu.schema";
import type {
  MenuListResponseDto,
  MenuListByCategoryResponseDto,
  MenuItemDetailDto,
  CreateMenuItemRequestDto,
  CreateMenuItemResponseDto,
  UpdateMenuItemRequestDto,
  UpdateMenuItemResponseDto,
} from "./dto";
import type { MenuListParams } from "~/services/api/menu/menu.types";

const {
  MenuListResponseSchema,
  MenuListByCategoryResponseSchema,
  MenuItemDetailSchema,
  CreateMenuItemResponseSchema,
  UpdateMenuItemResponseSchema,
} = MenuSchema;

/**
 * Get list of all menu items
 */
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

/**
 * Get list of menu items by category
 */
async function getMenuListByCategory(
  categoryId: string
): Promise<MenuListByCategoryResponseDto> {
  try {
    const resp = await http.get(Menu.listByCategory(categoryId));
    return MenuListByCategoryResponseSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

/**
 * Get menu item details by ID
 */
async function getMenuItemDetail(itemId: string): Promise<MenuItemDetailDto> {
  try {
    const resp = await http.get(Menu.detail(itemId));
    return MenuItemDetailSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

/**
 * Create a new menu item
 * Note: For file uploads, use FormData
 */
async function createMenuItem(
  data: CreateMenuItemRequestDto
): Promise<CreateMenuItemResponseDto> {
  try {
    const formData = new FormData();

    // Append non-file fields
    formData.append("CategoryId", data.CategoryId);
    formData.append("Code", data.Code);
    formData.append("Name", data.Name);
    formData.append("Description", data.Description);
    formData.append("UnitId", data.UnitId);
    formData.append("Price", data.Price.toString());
    formData.append("Active", data.Active.toString());

    // Append components as JSON string
    formData.append("Components", JSON.stringify(data.Components));

    // Append images if provided
    if (data.Images && data.Images.length > 0) {
      data.Images.forEach((file) => {
        formData.append("Images", file);
      });
    }

    const resp = await http.post(Menu.create, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return CreateMenuItemResponseSchema.parse(resp.data);
  } catch (error) {
    return Promise.reject(error);
  }
}

/**
 * Update an existing menu item
 * Note: For file uploads, use FormData
 */
async function updateMenuItem(
  itemId: string,
  data: UpdateMenuItemRequestDto
): Promise<UpdateMenuItemResponseDto> {
  try {
    const formData = new FormData();

    // Append non-file fields
    formData.append("CategoryId", data.CategoryId);
    formData.append("Code", data.Code);
    formData.append("Name", data.Name);
    formData.append("Description", data.Description);
    formData.append("UnitId", data.UnitId);
    formData.append("Price", data.Price.toString());
    formData.append("Active", data.Active.toString());

    // Append components as JSON string
    formData.append("Components", JSON.stringify(data.Components));

    // Append media IDs to remove
    if (data.RemoveMediaIds && data.RemoveMediaIds.length > 0) {
      data.RemoveMediaIds.forEach((id) => {
        formData.append("RemoveMediaIds", id);
      });
    }

    // Append new images if provided
    if (data.NewImages && data.NewImages.length > 0) {
      data.NewImages.forEach((file) => {
        formData.append("NewImages", file);
      });
    }

    const resp = await http.put(Menu.update(itemId), formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return resp.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

/**
 * Delete a menu item by ID
 */
async function deleteMenuItem(itemId: string): Promise<void> {
  try {
    await http.delete(Menu.delete(itemId));
  } catch (error) {
    return Promise.reject(error);
  }
}

export const MenuService = {
  getMenuList,
  getMenuListByCategory,
  getMenuItemDetail,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
};
