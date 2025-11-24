import { z } from "zod";

const StockAdjustmentItemSchema = z.object({
  id: z.string().uuid(),
  itemId: z.string().uuid(),
  itemCode: z.string(),
  itemName: z.string(),
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
  itemId: z.string(),
  quantityDiff: z.number().min(1, "Số lượng điều chỉnh phải khác 0"),
  note: z.string().optional(),
});

const CreateStockAdjustmentSchema = z.object({
  reason: z.string(),
  items: z.array(CreateStockAdjustmentItemSchema),
});

const StockAdjustmentDetailsSchema = StockAdjustmentListItemSchema;

const UpdateStockAdjustmentItemSchema = CreateStockAdjustmentItemSchema.extend({
  id: z.string().optional(),
});

const UpdateStockAdjustmentSchema = z.object({
  reason: z.string(),
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
