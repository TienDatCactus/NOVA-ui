import type { z } from "zod";
import { MenuSchema } from "~/services/api/menu/menu.schema";

const {
  MenuItemComponentSchema,
  MenuItemDetailSchema,
  MenuListItemSchema,
  MenuListResponseSchema,
  MenuListByCategoryResponseSchema,
  CreateMenuItemRequestSchema,
  CreateMenuItemResponseSchema,
  UpdateMenuItemRequestSchema,
  UpdateMenuItemResponseSchema,
} = MenuSchema;

// Menu Item Component types
export type MenuItemComponentDto = z.infer<typeof MenuItemComponentSchema>;

// Menu Item Detail types
export type MenuItemDetailDto = z.infer<typeof MenuItemDetailSchema>;

// Menu List types
export type MenuListItemDto = z.infer<typeof MenuListItemSchema>;
export type MenuListResponseDto = z.infer<typeof MenuListResponseSchema>;
export type MenuListByCategoryResponseDto = z.infer<
  typeof MenuListByCategoryResponseSchema
>;

// Create Menu Item types
export type CreateMenuItemRequestDto = z.infer<
  typeof CreateMenuItemRequestSchema
>;
export type CreateMenuItemResponseDto = z.infer<
  typeof CreateMenuItemResponseSchema
>;

// Update Menu Item types
export type UpdateMenuItemRequestDto = z.infer<
  typeof UpdateMenuItemRequestSchema
>;
export type UpdateMenuItemResponseDto = z.infer<
  typeof UpdateMenuItemResponseSchema
>;
