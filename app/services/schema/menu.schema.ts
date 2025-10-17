import z from "zod";
import { ROOM_TYPE } from "~/lib/constants";

const MenuItemComponentsSchema = z.object({
  itemId: z.uuid("ID thành phần không hợp lệ"),
  itemName: z.string().min(1, "Tên thành phần không hợp lệ"),
  quantity: z.number().int().min(0, "Số lượng phải >= 0"),
  notes: z.string().optional(),
});
const MenuItemSchema = z.object({
  itemId: z.uuid("ID mục không hợp lệ"),
  code: z.string().min(1, "Mã mục không hợp lệ"),
  name: z.string().min(1, "Tên mục không hợp lệ"),
  description: z.string().optional(),
  unitName: z.string().min(1, "Tên đơn vị không hợp lệ"),
  price: z.number().min(0, "Giá phải >= 0"),
  active: z.boolean(),
  components: z.array(MenuItemComponentsSchema).optional().default([]),
});

const MenuListResponseSchema = z.object({
  categoryId: z.uuid("ID danh mục không hợp lệ"),
  categoryCode: z.string().min(1, "Mã danh mục không hợp lệ"),
  categoryName: z.string().min(1, "Tên danh mục không hợp lệ"),
  active: z.boolean(),
  items: z.array(MenuItemSchema).default([]),
});
const useMenuSchema = () => {
  return {
    MenuItemSchema,
    MenuListResponseSchema,
    MenuItemComponentsSchema,
  };
};
export default useMenuSchema;
