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
  breakfastDays: z.array(z.string()).optional(),
});

const ServiceCategoryEnum = z.enum(["Service", "Menu"], {
  error: "Danh mục dịch vụ không hợp lệ",
});

const ServiceItem2Schema = z.object({
  serviceItemId: z.string().min(1, "ID dịch vụ không hợp lệ"),
  code: z.string().min(1, "Mã dịch vụ không hợp lệ"),
  name: z.string().min(1, "Tên dịch vụ không hợp lệ"),
  description: z.string().optional().nullable(),
  unitName: z.string().min(1, "Đơn vị tính không hợp lệ"),
  basePrice: z.number().min(0, "Giá cơ bản phải >= 0"),
  active: z.boolean(),
});

const ServiceTypeSchema = z.object({
  serviceTypeId: z.string().min(1, "ID loại dịch vụ không hợp lệ"),
  typeCode: z.string().min(1, "Mã loại dịch vụ không hợp lệ"),
  typeName: z.string().min(1, "Tên loại dịch vụ không hợp lệ"),
  active: z.boolean(),
  items: z.array(ServiceItem2Schema).default([]),
});

const ServiceListResponseSchema = z.array(ServiceTypeSchema);

// Create Service Schema
const CreateServiceRequestSchema = z.object({
  serviceTypeId: z.string().uuid("ID loại dịch vụ không hợp lệ"),
  unitId: z.string().uuid("ID đơn vị không hợp lệ"),
  code: z.string().min(1, "Mã dịch vụ không được để trống"),
  name: z.string().min(1, "Tên dịch vụ không được để trống"),
  description: z.string().optional(),
  basePrice: z.number().min(0, "Giá cơ bản phải >= 0"),
  active: z.boolean(),
});

const CreateServiceResponseSchema = z.object({
  id: z.string().uuid(),
  serviceTypeId: z.string().uuid(),
  serviceTypeName: z.string(),
  unitId: z.string().uuid(),
  unitName: z.string(),
  code: z.string(),
  name: z.string(),
  description: z.string().optional().nullable(),
  basePrice: z.number(),
  active: z.boolean(),
  createdAt: z.string().optional().nullable(),
  updatedAt: z.string().optional().nullable(),
});

// Service by Type Schema
const ServiceByTypeItemSchema = z.object({
  id: z.string().uuid(),
  serviceTypeId: z.string().uuid(),
  serviceTypeName: z.string(),
  unitId: z.string().uuid(),
  unitName: z.string(),
  code: z.string(),
  name: z.string(),
  description: z.string().optional().nullable(),
  basePrice: z.number(),
  active: z.boolean(),
  createdAt: z.string().optional().nullable(),
  updatedAt: z.string().optional().nullable(),
});

const ServiceByTypeResponseSchema = z.array(ServiceByTypeItemSchema);

const useServiceSchema = () => {
  return {
    ServiceItemSchema,
    ServicesSchema,
    ServiceCategoryEnum,
    ServiceListResponseSchema,
    ServiceItem2Schema,
    ServiceTypeSchema,
    CreateServiceRequestSchema,
    CreateServiceResponseSchema,
    ServiceByTypeItemSchema,
    ServiceByTypeResponseSchema,
  };
};
export default useServiceSchema;
