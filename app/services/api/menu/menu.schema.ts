import { z } from "zod";

export const MenuItemComponentSchema = z.object({
  itemId: z.string().min(1, "Vui lòng chọn nguyên liệu"),
  itemCode: z.string(),
  itemName: z.string(),
  quantity: z
    .number()
    .nonnegative("Số lượng phải lớn hơn hoặc bằng 0")
    .max(10000, "Số lượng không được vượt quá 10,000"),
  notes: z.string().max(200, "Ghi chú không được vượt quá 200 ký tự").nullish(),
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
  unitId: z.string().optional().nullable(),
  unitName: z.string().optional().nullable(),
  price: z.number().min(0),
  active: z.boolean(),
  createdAt: z.string().optional().nullable(),
  updatedAt: z.string().optional().nullable(),
  images: z
    .array(
      z.object({
        mediaId: z.string(),
        url: z.url(),
        caption: z.string().optional().nullable(),
        contentType: z.string(),
        displayOrder: z.number(),
      })
    )
    .optional(),
  components: z.array(MenuItemComponentDetailSchema),
});

export const MenuListItemSchema = z.object({
  itemId: z.string(),
  code: z.string(),
  name: z.string(),
  description: z.string(),
  imageUrls: z.array(z.string()),
  unitName: z.string().optional().nullable(),
  price: z.number().min(0),
  active: z.boolean(),
  maxQuantityAvailable: z.number().optional().nullable(),
  components: z.array(MenuItemComponentSchema),
});

export const MenuListByCategoryItemSchema = MenuItemDetailSchema;

export const MenuListResponseSchema = z.array(MenuListItemSchema);
export const MenuListByCategoryResponseSchema = z.array(
  MenuListByCategoryItemSchema
);

export const CreateMenuItemRequestSchema = z.object({
  CategoryId: z.string().min(1, "Vui lòng chọn danh mục"),
  Code: z
    .string()
    .min(1, "Mã SKU không được để trống")
    .max(50, "Mã SKU không được vượt quá 50 ký tự")
    .regex(
      /^[A-Z0-9-_]+$/,
      "Mã SKU chỉ chứa chữ in hoa, số, dấu gạch ngang và gạch dưới"
    ),
  Name: z
    .string()
    .min(1, "Tên món ăn không được để trống")
    .max(200, "Tên món ăn không được vượt quá 200 ký tự")
    .trim(),
  Description: z
    .string()
    .max(1000, "Mô tả không được vượt quá 1000 ký tự")
    .trim(),
  UnitId: z.string().min(1, "Vui lòng chọn đơn vị tính"),
  Price: z
    .number()
    .min(0, "Giá bán phải lớn hơn hoặc bằng 0")
    .max(1000000000, "Giá bán không được vượt quá 1 tỷ VNĐ")
    .int("Giá bán phải là số nguyên"),
  Active: z.boolean().default(true),
  Images: z
    .array(z.instanceof(File))
    .max(8, "Chỉ được tải lên tối đa 8 ảnh")
    .optional(),
  Components: z
    .array(MenuItemComponentSchema)
    .max(50, "Không được thêm quá 50 nguyên liệu"),
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
