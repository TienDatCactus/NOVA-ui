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

    formData.append("CategoryId", data.CategoryId);
    formData.append("Code", data.Code);
    formData.append("UnitId", data.UnitId);
    formData.append("Price", data.Price.toString());
    formData.append("Active", data.Active.toString());
    if (data.translations && data.translations.length > 0) {
      data.translations.forEach((translation, index) => {
        formData.append(
          `translations[${index}].languageCode`,
          translation.languageCode
        );
        formData.append(`translations[${index}].name`, translation.name);
        if (translation.description) {
          formData.append(
            `translations[${index}].description`,
            translation.description
          );
        }
      });
    }
    if (data.Images?.length) {
      data.Images.forEach((file) => {
        formData.append("Images", file);
      });
    }

    if (data.Components?.length) {
      data.Components.forEach((comp, index) => {
        Object.entries(comp).forEach(([key, value]) => {
          formData.append(`Components[${index}][${key}]`, String(value));
        });
      });
    }

    const resp = await http.post(Menu.create, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return CreateMenuItemResponseSchema.parse(resp.data);
  } catch (error) {
    return Promise.reject(error);
  }
}

/**
 * Update an existing menu comp
 * Note: For file uploads, use FormData
 */
async function updateMenuItem(
  itemId: string,
  data: UpdateMenuItemRequestDto
): Promise<UpdateMenuItemResponseDto> {
  try {
    const formData = new FormData();

    formData.append("CategoryId", data.CategoryId);
    formData.append("Code", data.Code);
    if (data.translations && data.translations.length > 0) {
      data.translations.forEach((translation, index) => {
        formData.append(
          `translations[${index}].languageCode`,
          translation.languageCode
        );
        formData.append(`translations[${index}].name`, translation.name);
        if (translation.description) {
          formData.append(
            `translations[${index}].description`,
            translation.description
          );
        }
      });
    }
    formData.append("UnitId", data.UnitId);
    formData.append("Price", data.Price.toString());
    formData.append("Active", data.Active.toString());

    if (data.Components?.length) {
      data.Components.forEach((comp, index) => {
        Object.entries(comp).forEach(([key, value]) => {
          formData.append(`Components[${index}][${key}]`, String(value));
        });
      });
    }

    if (data.RemoveMediaIds?.length) {
      data.RemoveMediaIds.forEach((id) => {
        formData.append("RemoveMediaIds", id);
      });
    }

    if (data.NewImages?.length) {
      data.NewImages.forEach((file) => {
        formData.append("NewImages", file);
      });
    }

    const resp = await http.put(Menu.update(itemId), formData, {
      headers: { "Content-Type": "multipart/form-data" },
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
    const resp = await http.delete(Menu.delete(itemId));
    return resp.data;
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
