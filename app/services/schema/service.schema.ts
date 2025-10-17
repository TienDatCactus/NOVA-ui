import z from "zod";

const ServiceItemSchema = z.object({
  id: z
    .uuid("ID dịch vụ không hợp lệ")
    .or(z.string().min(1, "ID dịch vụ không hợp lệ")),
  name: z.string().min(1, "Tên dịch vụ không hợp lệ"),
  price: z.number().min(0, "Giá dịch vụ không hợp lệ"),
  imageUrl: z.url("URL hình ảnh không hợp lệ").optional(),
  category: z.string().optional(),
  description: z.string().optional(),
  quantity: z.number().int().min(1, "Số lượng phải là số nguyên dương"),
});
const ServicesSchema = z.object({
  isBreakfast: z.boolean(),
  breakfastDays: z.array(z.date()).optional(),
});

const ServiceCategoryEnum = z.enum(["Dịch vụ", "Thức ăn", "Đồ uống"], {
  error: "Danh mục dịch vụ không hợp lệ",
});

const ServiceItem2Schema = z.object({
  serviceItemId: z.string().uuid("ID dịch vụ không hợp lệ"),
  code: z.string().min(1, "Mã dịch vụ không hợp lệ"),
  name: z.string().min(1, "Tên dịch vụ không hợp lệ"),
  description: z.string().optional(),
  unitName: z.string().min(1, "Đơn vị tính không hợp lệ"),
  basePrice: z.number().min(0, "Giá cơ bản phải >= 0"),
  active: z.boolean(),
});
const ServiceListResponseSchema = z.array(
  z.object({
    serviceTypeId: z.uuid("ID loại dịch vụ không hợp lệ"),
    typeCode: z.string().min(1, "Mã loại dịch vụ không hợp lệ"),
    typeName: z.string().min(1, "Tên loại dịch vụ không hợp lệ"),
    active: z.boolean(),
    items: z.array(ServiceItem2Schema).default([]),
  })
);

const useServiceSchema = () => {
  return {
    ServiceItemSchema,
    ServicesSchema,
    ServiceCategoryEnum,
    ServiceListResponseSchema,
  };
};
export default useServiceSchema;
