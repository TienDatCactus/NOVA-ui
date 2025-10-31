import z from "zod";

const ServiceTypeItemSchema = z.object({
  id: z.string(),
  code: z.string().min(2).max(100),
  name: z.string().min(2).max(100),
  description: z.string().min(2).max(500).nullable(),
  active: z.boolean(),
  createdAt: z.string().nullable().optional(),
  updatedAt: z.string().nullable().optional(),
  imageUrls: z.array(z.url()),
});

const ServiceTypeListResponseSchema = z.array(ServiceTypeItemSchema);

const UpdateServiceTypeRequestSchema = z.object({
  code: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  active: z.boolean(),
  newImages: z.array(z.instanceof(File).optional()),
  removeMediaIds: z.array(z.string()).optional(),
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

function useServiceTypesSchema() {
  return {
    ServiceTypeListResponseSchema,
    CreateServiceTypeRequestSchema,
    CreateServiceTypeResponseSchema,
    ServiceTypeItemDetailSchema,
    UpdateServiceTypeRequestSchema,
    UpdateServiceTypeResponseSchema,
  };
}
export default useServiceTypesSchema;
