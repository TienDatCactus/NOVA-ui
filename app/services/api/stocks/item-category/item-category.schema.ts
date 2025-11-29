import { z } from "zod";

const ItemCategoryListItemSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  description: z.string().optional().nullable(),
  isActive: z.boolean(),
  itemCount: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const ItemCategoriesListSchema = z.array(ItemCategoryListItemSchema);

const CreateItemCategorySchema = z.object({
  name: z.string(),
  description: z.string().optional().nullable(),
  isActive: z.boolean().optional().default(true),
});

const UpdateItemCategorySchema = z.object({
  name: z.string(),
  description: z.string().optional().nullable(),
  isActive: z.boolean(),
});

const ItemCategoryDetailsSchema = ItemCategoryListItemSchema;

export const ItemCategorySchemas = {
  ItemCategoryListItemSchema,
  ItemCategoriesListSchema,
  CreateItemCategorySchema,
  UpdateItemCategorySchema,
  ItemCategoryDetailsSchema,
};
