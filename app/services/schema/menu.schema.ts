import { z } from "zod";

export const MenuItemComponentSchema = z.object({
  itemId: z.string(),
  itemCode: z.string(),
  itemName: z.string(),
  quantity: z.number().nonnegative(),
  notes: z.string().nullish(),
});

const MenuItemComponentDetailSchema = z.object({
  id: z.string(),
  menuItemId: z.string(),
  itemId: z.string(),
  itemName: z.string(),
  quantity: z.number().nonnegative(),
  notes: z.string().nullish(),
});

export const MenuItemDetailSchema = z.object({
  id: z.string(),
  categoryId: z.string(),
  categoryName: z.string(),
  code: z.string(),
  name: z.string(),
  description: z.string(),
  unitId: z.string(),
  unitName: z.string(),
  price: z.number().min(0),
  active: z.boolean(),
  createdAt: z.string().optional().nullable(),
  updatedAt: z.string().optional().nullable(),
  imageUrls: z.array(z.string()),
  components: z.array(MenuItemComponentDetailSchema),
});

export const MenuListItemSchema = z.object({
  itemId: z.string(),
  code: z.string(),
  name: z.string(),
  description: z.string(),
  imageUrls: z.array(z.string()),
  unitName: z.string(),
  price: z.number().min(0),
  active: z.boolean(),
  components: z.array(MenuItemComponentSchema),
});

export const MenuListResponseSchema = z.array(MenuListItemSchema);
export const MenuListByCategoryResponseSchema = z.array(MenuListItemSchema);

export const CreateMenuItemRequestSchema = z.object({
  CategoryId: z.string(),
  Code: z.string(),
  Name: z.string(),
  Description: z.string(),
  UnitId: z.string(),
  Price: z.number().min(0),
  Active: z.boolean().default(true),
  Images: z.array(z.instanceof(File)).optional(),
  Components: z.array(MenuItemComponentSchema),
});

export const CreateMenuItemResponseSchema = MenuItemDetailSchema;

export const UpdateMenuItemRequestSchema = z.object({
  CategoryId: z.string(),
  Code: z.string(),
  Name: z.string(),
  Description: z.string(),
  UnitId: z.string(),
  Price: z.number().min(0),
  Active: z.boolean().default(true),
  RemoveMediaIds: z.array(z.string()).default([]),
  NewImages: z.array(z.instanceof(File)).optional(),
  Components: z.array(MenuItemComponentSchema),
});

export const UpdateMenuItemResponseSchema = MenuItemDetailSchema;

export const MenuSchema = {
  MenuItemComponentSchema,
  MenuItemDetailSchema,
  MenuListItemSchema,
  MenuListResponseSchema,
  MenuListByCategoryResponseSchema,
  CreateMenuItemRequestSchema,
  CreateMenuItemResponseSchema,
  UpdateMenuItemRequestSchema,
  UpdateMenuItemResponseSchema,
};
