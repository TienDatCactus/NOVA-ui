import type z from "zod";
import useMenuSchema from "~/services/schema/menu.schema";

const {
  MenuItemSchema,
  MenuCategoryWithItemsSchema,
  MenuListResponseSchema,
  MenuItemDetailSchema,
  CreateMenuItemRequestSchema,
  CreateMenuItemResponseSchema,
  UpdateMenuItemRequestSchema,
  UpdateMenuItemResponseSchema,
} = useMenuSchema();

export type MenuItem = z.infer<typeof MenuItemSchema>;
export type MenuCategoryWithItems = z.infer<typeof MenuCategoryWithItemsSchema>;
export type MenuListResponseDto = z.infer<typeof MenuListResponseSchema>;
export type MenuItemDetailDto = z.infer<typeof MenuItemDetailSchema>;
export type CreateMenuItemRequestDto = z.infer<
  typeof CreateMenuItemRequestSchema
>;
export type CreateMenuItemResponseDto = z.infer<
  typeof CreateMenuItemResponseSchema
>;
export type UpdateMenuItemRequestDto = z.infer<
  typeof UpdateMenuItemRequestSchema
>;
export type UpdateMenuItemResponseDto = z.infer<
  typeof UpdateMenuItemResponseSchema
>;
