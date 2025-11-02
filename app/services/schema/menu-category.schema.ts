import { z } from "zod";

const MenuCategoryItemSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  active: z.boolean(),
  menuItemCount: z.number().int(),
  createdAt: z.string().optional().nullable(),
  updatedAt: z.string().optional().nullable(),
});

const EditMenuCategoryRequestSchema = z.object({
  code: z.string(),
  name: z.string(),
  active: z.boolean(),
});

const UpdateMenuCategoryRequestSchema = EditMenuCategoryRequestSchema;
const CreateMenuCategoryRequestSchema = EditMenuCategoryRequestSchema;
const CreateMenuCategoryResponseSchema = MenuCategoryItemSchema;
const MenuCategoryListResponseSchema = z.array(MenuCategoryItemSchema);

export const MenuCategorySchema = {
  MenuCategoryItemSchema,
  EditMenuCategoryRequestSchema,
  UpdateMenuCategoryRequestSchema,
  CreateMenuCategoryRequestSchema,
  CreateMenuCategoryResponseSchema,
  MenuCategoryListResponseSchema,
};
