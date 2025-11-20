import type { z } from "zod";
import { ItemCategorySchemas } from "./item-category.schema";

export type ItemCategoryListItemDto = z.infer<
  typeof ItemCategorySchemas.ItemCategoryListItemSchema
>;

export type ItemCategoriesListDto = z.infer<
  typeof ItemCategorySchemas.ItemCategoriesListSchema
>;

export type CreateItemCategoryDto = z.infer<
  typeof ItemCategorySchemas.CreateItemCategorySchema
>;

export type UpdateItemCategoryDto = z.infer<
  typeof ItemCategorySchemas.UpdateItemCategorySchema
>;

export type ItemCategoryDetailsDto = z.infer<
  typeof ItemCategorySchemas.ItemCategoryDetailsSchema
>;
