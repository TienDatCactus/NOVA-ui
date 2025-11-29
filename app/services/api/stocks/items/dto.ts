import type { z } from "zod";
import { StockItemsSchemas } from "./items.schema";

export type StockItemsListItemDto = z.infer<
  typeof StockItemsSchemas.StockItemsListItemSchema
>;

export type StockItemsListDto = z.infer<
  typeof StockItemsSchemas.StockItemsListSchema
>;

export type StockCreateItemDto = z.infer<
  typeof StockItemsSchemas.StockCreateItemSchema
>;

export type StockUpdateItemDto = z.infer<
  typeof StockItemsSchemas.StockUpdateItemSchema
>;

export type StockItemDetailsDto = z.infer<
  typeof StockItemsSchemas.StockItemDetailsSchema
>;

export type StockTransactionsItemDto = z.infer<
  typeof StockItemsSchemas.StockTransactionsItemSchema
>;

export type StockTransactionsResponseDto = z.infer<
  typeof StockItemsSchemas.StockTransactionsResponseSchema
>;

export type StockAdjustRequestDto = z.infer<
  typeof StockItemsSchemas.StockAdjustRequestSchema
>;
