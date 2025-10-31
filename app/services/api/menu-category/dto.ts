import type z from "zod";
import useMenuCategorySchema from "~/services/schema/menu-category.schema";

const {
  MenuCategoryItemSchema,
  MenuCategoryListResponseSchema,
  MenuCategoryDetailSchema,
  CreateMenuCategoryRequestSchema,
  CreateMenuCategoryResponseSchema,
  UpdateMenuCategoryRequestSchema,
  UpdateMenuCategoryResponseSchema,
} = useMenuCategorySchema();

export type MenuCategoryItem = z.infer<typeof MenuCategoryItemSchema>;
export type MenuCategoryListResponseDto = z.infer<
  typeof MenuCategoryListResponseSchema
>;
export type MenuCategoryDetailDto = z.infer<typeof MenuCategoryDetailSchema>;
export type CreateMenuCategoryRequestDto = z.infer<
  typeof CreateMenuCategoryRequestSchema
>;
export type CreateMenuCategoryResponseDto = z.infer<
  typeof CreateMenuCategoryResponseSchema
>;
export type UpdateMenuCategoryRequestDto = z.infer<
  typeof UpdateMenuCategoryRequestSchema
>;
export type UpdateMenuCategoryResponseDto = z.infer<
  typeof UpdateMenuCategoryResponseSchema
>;
