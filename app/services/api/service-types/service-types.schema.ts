import z from "zod";

const ServiceTypeItemSchema = z.object({
  id: z.string(),
  code: z.string().min(2).max(100),
  name: z.string().min(2).max(100),
  description: z.string().min(2).max(500).nullable(),
  active: z.boolean(),
  serviceItemCount: z.number().optional(),
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

const ServiceTypeListResponseSchema = z.array(ServiceTypeItemSchema);

const UpdateServiceTypeRequestSchema = z.object({
  code: z
    .string("Mã dịch vụ không hợp lệ")
    .min(1, "Mã dịch vụ không được để trống"),

  name: z
    .string("Tên dịch vụ không hợp lệ")
    .min(1, "Tên dịch vụ không được để trống"),

  description: z.string("Mô tả phải là chuỗi").nullable().optional(),

  active: z.boolean("Trạng thái hoạt động không hợp lệ"),

  newImages: z
    .array(
      z.instanceof(File, { message: "Tệp tải lên không hợp lệ" }).optional(),
      "Danh sách hình ảnh không hợp lệ"
    )
    .optional(),

  removeMediaIds: z.array(z.string("ID tệp phải là chuỗi")).optional(),
});

const CreateServiceTypeRequestSchema = z.object({
  code: z.string(),
  name: z.string(),
  description: z.string(),
  active: z.boolean(),
  images: z.array(z.instanceof(File).optional()),
});

const CreateServiceTypeResponseSchema = ServiceTypeItemSchema;
const ServiceTypeItemDetailSchema = ServiceTypeItemSchema;
const UpdateServiceTypeResponseSchema = ServiceTypeItemSchema;

export const ServiceTypesSchema = {
  ServiceTypeListResponseSchema,
  CreateServiceTypeRequestSchema,
  CreateServiceTypeResponseSchema,
  ServiceTypeItemDetailSchema,
  UpdateServiceTypeRequestSchema,
  UpdateServiceTypeResponseSchema,
};
