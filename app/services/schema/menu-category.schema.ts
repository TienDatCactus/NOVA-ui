import z from "zod";

// Menu Category Item Schema
const MenuCategoryItemSchema = z.object({
  id: z.string().uuid(),
  code: z.string(),
  name: z.string(),
  active: z.boolean(),
});

const MenuCategoryListResponseSchema = z.array(MenuCategoryItemSchema);

const MenuCategoryDetailSchema = MenuCategoryItemSchema;

// Edit/Create Request Schema
const EditMenuCategoryRequestSchema = z.object({
  code: z.string().min(1, "Mã danh mục không được để trống"),
  name: z.string().min(1, "Tên danh mục không được để trống"),
  active: z.boolean(),
});

// Create/Update Schemas
const CreateMenuCategoryRequestSchema = EditMenuCategoryRequestSchema;
const UpdateMenuCategoryRequestSchema = EditMenuCategoryRequestSchema;
const CreateMenuCategoryResponseSchema = MenuCategoryItemSchema;
const UpdateMenuCategoryResponseSchema = MenuCategoryItemSchema;

function useMenuCategorySchema() {
  return {
    MenuCategoryItemSchema,
    MenuCategoryListResponseSchema,
    MenuCategoryDetailSchema,
    CreateMenuCategoryRequestSchema,
    CreateMenuCategoryResponseSchema,
    UpdateMenuCategoryRequestSchema,
    UpdateMenuCategoryResponseSchema,
  };
}

export default useMenuCategorySchema;
