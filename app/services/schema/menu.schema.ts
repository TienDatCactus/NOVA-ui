import z from "zod";

const MenuItemComponentSchema = z.object({
  itemId: z.string(),
  itemCode: z.string(),
  itemName: z.number(),
  notes: z.string(),
});

const MenuItemSchema = z.object({
  itemId: z.string(),
  code: z.string(),
  name: z.string(),
  description: z.string(),
  imageUrls: z.array(z.url()).optional().nullable(),
  unitName: z.string(),
  price: z.number().min(0),
  active: z.boolean(),
  components: z.array(MenuItemComponentSchema),
});

const MenuListItemSchema = z.object({
  categoryId: z.string(),
  categoryCode: z.strictObject,
  categoryName: z.string(),
  active: true,
  items: z.array(MenuItemSchema),
});

const MenuListResponseSchema = z.array(MenuListItemSchema);

// Menu Item Detail (chi tiết món ăn)
const MenuItemDetailSchema = z.object({
  id: z.string(),
  categoryId: z.string(),
  categoryName: z.string(),
  code: z.string(),
  name: z.string(),
  description: z.string(),
  unitId: z.string(),
  unitName: z.string(),
  price: z.number().min(0),
  active: z.boolean,
  imageUrls: z.array(z.url()).optional().nullable(),
  components: z.array(MenuItemComponentSchema),
});

const CreateMenuItemRequestSchema = z.object({
  categoryId: z.string().uuid(),
  code: z.string().min(1, "Mã món ăn không được để trống"),
  name: z.string().min(1, "Tên món ăn không được để trống"),
  description: z.string().optional(),
  unitId: z.string().uuid(),
  price: z.number().min(0, "Giá phải lớn hơn hoặc bằng 0"),
  active: z.boolean().default(true),
  components: z
    .array(
      z.object({
        itemId: z.string().uuid(),
        quantity: z.number().min(0),
        notes: z.string().optional().default(""),
      })
    )
    .optional()
    .default([]),
});

const UpdateMenuItemRequestSchema = CreateMenuItemRequestSchema;

// Create/Update Response Schema
const CreateMenuItemResponseSchema = MenuItemDetailSchema;
const UpdateMenuItemResponseSchema = MenuItemDetailSchema;

const useMenuSchema = () => {
  return {
    MenuItemSchema,
    MenuItemComponentSchema,
    MenuListResponseSchema,
    MenuItemDetailSchema,
    CreateMenuItemRequestSchema,
    CreateMenuItemResponseSchema,
    UpdateMenuItemRequestSchema,
    UpdateMenuItemResponseSchema,
  };
};

export default useMenuSchema;
