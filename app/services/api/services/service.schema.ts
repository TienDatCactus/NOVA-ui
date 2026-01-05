import z from "zod";

// general CRUD ops
const ServiceListItemSchema = z.object({
  serviceItemId: z.string(),
  code: z.string().min(2),
  translations: z
    .array(
      z.object({
        languageCode: z.string(),
        name: z.string(),
        description: z.string().optional().nullable(),
      })
    )
    .optional(),
  unitName: z.string().max(100),
  basePrice: z.number().min(0),
  active: z.boolean().default(true),
  imageUrls: z.array(z.url()).optional(),
});

const ServiceItemSchema = z.object({
  id: z.string(),
  serviceTypeId: z.string(),
  serviceTypeName: z.string(),
  unitId: z.string(),
  unitName: z.string(),
  code: z.string().min(2),
  translations: z
    .array(
      z.object({
        languageCode: z.string(),
        name: z.string(),
        description: z.string().optional().nullable(),
      })
    )
    .optional(),
  basePrice: z.number().min(0),
  active: z.boolean().default(true),
  createdAt: z.string().nullable().optional(),
  updatedAt: z.string().nullable().optional(),
  images: z
    .array(
      z.object({
        mediaId: z.string(),
        url: z.url(),
        caption: z.string().optional().nullable(),
        contentType: z.string().optional().nullable(),
        displayOrder: z.number().optional().nullable(),
      })
    )
    .optional(),
});

const ServiceListByTypeResponseSchema = z.array(ServiceItemSchema);
const ServiceListResponseSchema = z.array(ServiceListItemSchema);
const ServiceItemDetailResponseSchema = ServiceItemSchema;

const EditServiceItemRequestSchema = z.object({
  serviceTypeId: z.string("Phải chọn loại dịch vụ"),
  unitId: z.string("Phải chọn đơn vị tính"),
  code: z.string("Phải nhập mã dịch vụ").min(2),
  translations: z
    .array(
      z.object({
        languageCode: z.string(),
        name: z.string("Phải nhập tên dịch vụ").min(2),
        description: z.string("Phải nhập mô tả dịch vụ").max(500),
      })
    )
    .optional(),
  basePrice: z.number("Phải nhập giá cơ bản").min(0),
  active: z.boolean(),
});
const CreateServiceItemRequestSchema = EditServiceItemRequestSchema;
const UpdateServiceItemRequestSchema = EditServiceItemRequestSchema;
const CreateServiceItemResponseSchema = ServiceItemSchema;
const UpdateServiceItemResponseSchema = ServiceItemSchema;

export const ServiceSchema = {
  ServiceItemSchema,
  ServiceListResponseSchema,
  ServiceListByTypeResponseSchema,
  ServiceItemDetailResponseSchema,
  UpdateServiceItemResponseSchema,
  CreateServiceItemResponseSchema,
  UpdateServiceItemRequestSchema,
  CreateServiceItemRequestSchema,
  ServiceListItemSchema,
};
