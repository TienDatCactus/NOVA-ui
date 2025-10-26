import z from "zod";

const UnitItemSchema = z.object({
  id: z.string().uuid("ID đơn vị không hợp lệ"),
  code: z.string().min(1, "Mã đơn vị không hợp lệ"),
  name: z.string().min(1, "Tên đơn vị không hợp lệ"),
  active: z.boolean(),
});

const UnitsListResponseSchema = z.object({
  success: z.boolean(),
  statusCode: z.number(),
  message: z.string(),
  data: z.array(UnitItemSchema),
  meta: z.string().optional().nullable(),
});

const useUnitSchema = () => {
  return {
    UnitItemSchema,
    UnitsListResponseSchema,
  };
};

export default useUnitSchema;
