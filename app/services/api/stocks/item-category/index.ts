import http from "~/lib/http";
import { Stock } from "~/services/url";
import { ItemCategorySchemas } from "./item-category.schema";
import type {
  ItemCategoriesListDto,
  CreateItemCategoryDto,
  UpdateItemCategoryDto,
  ItemCategoryDetailsDto,
} from "./dto";
import type { ItemCategoryListParams } from "./item-category.types";

const {
  ItemCategoriesListSchema,
  CreateItemCategorySchema,
  UpdateItemCategorySchema,
  ItemCategoryDetailsSchema,
} = ItemCategorySchemas;

async function getItemCategoryList(
  params?: ItemCategoryListParams
): Promise<ItemCategoriesListDto> {
  try {
    const resp = await http.get(Stock.ItemCategories.list, { params });
    return ItemCategoriesListSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function createItemCategory(
  data: CreateItemCategoryDto
): Promise<ItemCategoryDetailsDto> {
  try {
    const validatedData = CreateItemCategorySchema.parse(data);
    const resp = await http.post(Stock.ItemCategories.create, validatedData);
    return ItemCategoryDetailsSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function getItemCategoryDetail(
  id: string
): Promise<ItemCategoryDetailsDto> {
  try {
    const resp = await http.get(Stock.ItemCategories.detail(id));
    return ItemCategoryDetailsSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function updateItemCategory(
  id: string,
  data: UpdateItemCategoryDto
): Promise<ItemCategoryDetailsDto> {
  try {
    const validatedData = UpdateItemCategorySchema.parse(data);
    const resp = await http.put(Stock.ItemCategories.update(id), validatedData);
    return ItemCategoryDetailsSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function deleteItemCategory(id: string): Promise<void> {
  try {
    const resp = await http.delete(Stock.ItemCategories.delete(id));
    return resp.data;
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

export const ItemCategoryService = {
  getItemCategoryList,
  createItemCategory,
  getItemCategoryDetail,
  updateItemCategory,
  deleteItemCategory,
};
