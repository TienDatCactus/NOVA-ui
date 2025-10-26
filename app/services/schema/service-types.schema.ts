import z from "zod";

const ServiceTypeItemSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  active: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const ServiceTypeListResponseSchema = z.array(ServiceTypeItemSchema);

const CreateServiceTypeSchema = z.object({
  code: z.string(),
  name: z.string(),
  description: z.string(),
  active: z.boolean(),
});

const UpdateServiceTypeSchema = z.object({
  code: z.string(),
  name: z.string(),
  description: z.string(),
  active: z.boolean(),
});

const CreateServiceTypeResponseSchema = ServiceTypeItemSchema;
const ServiceTypeItemDetailSchema = ServiceTypeItemSchema;
const UpdateServiceTypeResponseSchema = ServiceTypeItemSchema;

function useServiceTypesSchema() {
  return {
    ServiceTypeListResponseSchema,
    CreateServiceTypeSchema,
    CreateServiceTypeResponseSchema,
    ServiceTypeItemDetailSchema,
    UpdateServiceTypeSchema,
    UpdateServiceTypeResponseSchema,
  };
}
export default useServiceTypesSchema;
