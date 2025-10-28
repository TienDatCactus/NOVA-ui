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

const EditServiceTypeRequestSchema = z.object({
  code: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  active: z.boolean(),
});

const UpdateServiceTypeRequestSchema = EditServiceTypeRequestSchema;

const CreateServiceTypeRequestSchema = EditServiceTypeRequestSchema;

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
