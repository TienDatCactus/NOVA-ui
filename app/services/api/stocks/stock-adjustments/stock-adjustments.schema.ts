import { z } from "zod";

const StockAdjustmentItemSchema = z.object({
  id: z.string(),
  itemId: z.string(),
  itemCode: z.string(),
  itemName: z.string(),
  unitCode: z.string(),
  unitName: z.string(),
  quantityDiff: z.number(),
  note: z.string(),
});

const StockAdjustmentListItemSchema = z.object({
  id: z.uuid(),
  reference: z.string(),
  adjustmentDate: z.string(),
  reason: z.string(),
  isApplied: z.boolean(),
  items: z.array(StockAdjustmentItemSchema),
});

const StockAdjustmentListSchema = z.array(StockAdjustmentListItemSchema);

const CreateStockAdjustmentItemSchema = z.object({
  itemId: z.string("Vui lòng chọn hàng hóa").min(1, "Vui lòng chọn hàng hóa"),
  quantityDiff: z.number("Số lượng điều chỉnh phải là số"),
  note: z.string().optional(),
});

const CreateStockAdjustmentSchema = z.object({
  reason: z.string("Lý do là bắt buộc").min(1, "Lý do là bắt buộc"),
  items: z.array(CreateStockAdjustmentItemSchema),
});

const StockAdjustmentDetailsSchema = StockAdjustmentListItemSchema;

const UpdateStockAdjustmentItemSchema = CreateStockAdjustmentItemSchema.extend({
  id: z.string("Hàng hóa là bắt buộc").optional(),
});

const UpdateStockAdjustmentSchema = z.object({
  reason: z.string("Lý do là bắt buộc").min(1, "Lý do là bắt buộc"),
  items: z.array(UpdateStockAdjustmentItemSchema),
});

export const StockAdjustmentsSchemas = {
  StockAdjustmentListSchema,
  StockAdjustmentListItemSchema,
  StockAdjustmentItemSchema,
  CreateStockAdjustmentItemSchema,
  CreateStockAdjustmentSchema,
  StockAdjustmentDetailsSchema,
  UpdateStockAdjustmentItemSchema,
  UpdateStockAdjustmentSchema,
};
