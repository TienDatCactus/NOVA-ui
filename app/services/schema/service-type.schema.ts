import z from "zod";

const ServiceTypeItemSchema = z.object({
  id: z.string().uuid("ID loại dịch vụ không hợp lệ"),
  code: z.string().min(1, "Mã loại dịch vụ không hợp lệ"),
  name: z.string().min(1, "Tên loại dịch vụ không hợp lệ"),
  description: z.string().optional().nullable(),
  active: z.boolean(),
  createdAt: z.string().optional().nullable(),
  updatedAt: z.string().optional().nullable(),
});

const ServiceTypesListResponseSchema = z.array(ServiceTypeItemSchema);

const useServiceTypeSchema = () => {
  return {
    ServiceTypeItemSchema,
    ServiceTypesListResponseSchema,
  };
};

export default useServiceTypeSchema;
