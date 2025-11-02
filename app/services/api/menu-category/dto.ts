import type { z } from "zod";
import { MenuCategorySchema } from "~/services/schema/menu-category.schema";

const {
  MenuCategoryItemSchema,
  EditMenuCategoryRequestSchema,
  UpdateMenuCategoryRequestSchema,
  CreateMenuCategoryRequestSchema,
  CreateMenuCategoryResponseSchema,
  MenuCategoryListResponseSchema,
} = MenuCategorySchema;

// Menu Category Item types
export type MenuCategoryItemDto = z.infer<typeof MenuCategoryItemSchema>;

// Menu Category Detail type (same as item)
export type MenuCategoryDetailDto = z.infer<typeof MenuCategoryItemSchema>;

// Menu Category List types
export type MenuCategoryListResponseDto = z.infer<
  typeof MenuCategoryListResponseSchema
>;

// Create Menu Category types
export type CreateMenuCategoryRequestDto = z.infer<
  typeof CreateMenuCategoryRequestSchema
>;
export type CreateMenuCategoryResponseDto = z.infer<
  typeof CreateMenuCategoryResponseSchema
>;

// Update Menu Category types
export type UpdateMenuCategoryRequestDto = z.infer<
  typeof UpdateMenuCategoryRequestSchema
>;
export type UpdateMenuCategoryResponseDto = MenuCategoryItemDto;

// Edit Menu Category type (shared schema)
export type EditMenuCategoryRequestDto = z.infer<
  typeof EditMenuCategoryRequestSchema
>;
