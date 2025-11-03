import z from "zod";

const UnitItemSchema = z.object({
  id: z.string().min(1, "Mã đơn vị không hợp lệ"),
  code: z.string().min(1, "Mã đơn vị không hợp lệ"),
  name: z.string().min(1, "Tên đơn vị không hợp lệ"),
  active: z.boolean(),
});

const EditUnitRequestSchema = z.object({
  code: z.string().min(1, "Mã đơn vị không hợp lệ"),
  name: z.string().min(1, "Tên đơn vị không hợp lệ"),
  active: z.boolean(),
});
const CreateUnitRequestSchema = EditUnitRequestSchema;
const UpdateUnitRequestSchema = EditUnitRequestSchema;

const CreateUnitResponseSchema = UnitItemSchema;
const UpdateUnitResponseSchema = UnitItemSchema;

const UnitItemDetailResponseSchema = UnitItemSchema;
const UnitListResponseSchema = z.array(UnitItemSchema);

export const UnitSchema = {
  UnitItemSchema,
  UnitListResponseSchema,
  UnitItemDetailResponseSchema,
  CreateUnitRequestSchema,
  CreateUnitResponseSchema,
  UpdateUnitRequestSchema,
  UpdateUnitResponseSchema,
};
