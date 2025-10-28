import z from "zod";

const MenuItemComponentsSchema = z.object({
  itemId: z.string(),
  itemName: z.string(),
  quantity: z.number().min(0),
  notes: z.string(),
});

const MenuItemSchema = z.object({
  itemId: z.string(),
  code: z.string(),
  name: z.string(),
  description: z.string(),
  unitName: z.string(),
  price: z.number().min(0),
  active: z.boolean(),
  components: z.array(MenuItemComponentsSchema),
});

const MenuListItemSchema = z.object({
  categoryId: z.string(),
  categoryCode: z.string(),
  categoryName: z.string(),
  active: z.boolean(),
  items: z.array(MenuItemSchema),
});

const EditMenuItemSchema = z.object({
  categoryId: z.string(),
  code: z.string().min(2).max(100),
  name: z.string().min(2).max(100),
  description: z.string().min(2).max(500),
  unitId: z.string(),
  price: z.number().min(0),
  active: true,
  components: [
    {
      itemId: z.string(),
      quantity: z.number().min(0),
      notes: z.string(),
    },
  ],
});
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
  active: z.boolean(),
  components: [
    {
      id: z.string(),
      menuItemId: z.string(),
      itemId: z.string(),
      itemName: z.string(),
      quantity: z.number().min(0),
      notes: z.string(),
    },
  ],
});
// -------------------------
const CreateMenuItemSchema = EditMenuItemSchema;
const UpdateMenuItemSchema = EditMenuItemSchema;
const CreateMenuItemResponseSchema = z.object({
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
  components: [
    {
      id: z.string(),
      menuItemId: z.string(),
      itemId: z.string(),
      itemName: z.string(),
      quantity: z.number().min(0),
      notes: z.string(),
    },
  ],
});
const MenuListResponseSchema = z.array(MenuListItemSchema);
const MenuItemDetailResponseSchema = MenuItemDetailSchema;
const useMenuSchema = () => {
  return {
    MenuItemSchema,
    MenuListResponseSchema,
    MenuItemComponentsSchema,
  };
};
export default useMenuSchema;
