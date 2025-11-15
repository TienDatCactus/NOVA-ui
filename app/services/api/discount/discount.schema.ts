import z from "zod";

const EntityTypeEnum = z.enum(["PosOrder", "Booking", "ServiceOrder"]);

const DiscountApplyRequestSchema = z.object({
  entityType: EntityTypeEnum,
  entityId: z.string().min(1, "Mã thực thể không được để trống"),
  discountPercent: z.number().min(0).max(100).optional(),
  discountAmount: z.number().min(0).optional(),
});

const DiscountOverrideRequestSchema = z.object({
  entityType: EntityTypeEnum,
  entityId: z.string().min(1, "Mã thực thể không được để trống"),
  overrideAmount: z.number().min(0),
  overrideReason: z.string().min(1, "Lý do ghi đè không được để trống"),
});

export const DiscountSchema = {
  DiscountApplyRequestSchema,
  DiscountOverrideRequestSchema,
  EntityTypeEnum,
};
