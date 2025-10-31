import z from "zod";

// Component Schema (nguyên liệu trong món ăn)
const MenuItemComponentSchema = z.object({
  itemId: z.string().uuid(),
  itemName: z.string(),
  quantity: z.number().min(0),
  notes: z.string(),
});

// Component Schema for Detail/Response (có thêm id và menuItemId)
const MenuItemComponentDetailSchema = z.object({
  id: z.string().uuid(),
  menuItemId: z.string().uuid(),
  itemId: z.string().uuid(),
  itemName: z.string(),
  quantity: z.number().min(0),
  notes: z.string(),
});

// Menu Item Schema (món ăn trong list)
const MenuItemSchema = z.object({
  itemId: z.string().uuid(),
  code: z.string(),
  name: z.string(),
  description: z.string(),
  imageUrls: z.array(z.string()).optional().nullable(),
  unitName: z.string(),
  price: z.number().min(0),
  active: z.boolean(),
  components: z.array(MenuItemComponentSchema),
});

// Menu Category with Items (danh mục + món ăn)
const MenuCategoryWithItemsSchema = z.object({
  categoryId: z.string().uuid(),
  categoryCode: z.string(),
  categoryName: z.string(),
  active: z.boolean(),
  items: z.array(MenuItemSchema),
});

// List Response
const MenuListResponseSchema = z.array(MenuCategoryWithItemsSchema);

// Menu Item Detail (chi tiết món ăn)
const MenuItemDetailSchema = z.object({
  id: z.string().uuid(),
  categoryId: z.string().uuid(),
  categoryName: z.string(),
  code: z.string(),
  name: z.string(),
  description: z.string(),
  imageUrls: z.array(z.string()).optional().nullable(),
  unitId: z.string().uuid(),
  unitName: z.string(),
  price: z.number().min(0),
  active: z.boolean(),
  components: z.array(MenuItemComponentDetailSchema),
});

// Create/Update Request Schema
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
    MenuItemComponentDetailSchema,
    MenuCategoryWithItemsSchema,
    MenuListResponseSchema,
    MenuItemDetailSchema,
    CreateMenuItemRequestSchema,
    CreateMenuItemResponseSchema,
    UpdateMenuItemRequestSchema,
    UpdateMenuItemResponseSchema,
  };
};

export default useMenuSchema;
