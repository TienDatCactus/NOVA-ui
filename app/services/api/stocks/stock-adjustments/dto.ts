import type { z } from "zod";
import { StockAdjustmentsSchemas } from "./stock-adjustments.schema";

export type StockAdjustmentItemDto = z.infer<
  typeof StockAdjustmentsSchemas.StockAdjustmentItemSchema
>;

export type StockAdjustmentListItemDto = z.infer<
  typeof StockAdjustmentsSchemas.StockAdjustmentListItemSchema
>;

export type StockAdjustmentListDto = z.infer<
  typeof StockAdjustmentsSchemas.StockAdjustmentListSchema
>;

export type CreateStockAdjustmentItemDto = z.infer<
  typeof StockAdjustmentsSchemas.CreateStockAdjustmentItemSchema
>;

export type CreateStockAdjustmentDto = z.infer<
  typeof StockAdjustmentsSchemas.CreateStockAdjustmentSchema
>;

export type StockAdjustmentDetailsDto = z.infer<
  typeof StockAdjustmentsSchemas.StockAdjustmentDetailsSchema
>;

export type UpdateStockAdjustmentItemDto = z.infer<
  typeof StockAdjustmentsSchemas.UpdateStockAdjustmentItemSchema
>;

export type UpdateStockAdjustmentDto = z.infer<
  typeof StockAdjustmentsSchemas.UpdateStockAdjustmentSchema
>;
