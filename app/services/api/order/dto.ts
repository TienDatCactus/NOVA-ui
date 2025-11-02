import type { z } from "zod";
import { OrderSchema } from "./order.schema";

const {
  ServiceOrderSchema,
  ServiceOrderItemSchema,
  CreatePOSOrderRequestSchema,
  CreatePOSOrderResponseSchema,
  AddItemsToPOSOrderRequestSchema,
  AddItemsToPOSOrderResponseSchema,
  POSOrderItemSchema,
  POSOrderDetailSchema,
  POSOrderDetailResponseSchema,
  POSOrderListItemSchema,
  POSOrderListResponseSchema,
  POSOrderPrintItemSchema,
  POSOrderPrintDataSchema,
} = OrderSchema;

// Service Order types
export type ServiceOrderItemDto = z.infer<typeof ServiceOrderItemSchema>;
export type ServiceOrderDto = z.infer<typeof ServiceOrderSchema>;

// POS Order Request/Response types
export type CreatePOSOrderRequestDto = z.infer<
  typeof CreatePOSOrderRequestSchema
>;
export type CreatePOSOrderResponseDto = z.infer<
  typeof CreatePOSOrderResponseSchema
>;

export type AddItemsToPOSOrderRequestDto = z.infer<
  typeof AddItemsToPOSOrderRequestSchema
>;
export type AddItemsToPOSOrderResponseDto = z.infer<
  typeof AddItemsToPOSOrderResponseSchema
>;

// POS Order Detail types
export type POSOrderItemDto = z.infer<typeof POSOrderItemSchema>;
export type POSOrderDetailDto = z.infer<typeof POSOrderDetailSchema>;
export type POSOrderDetailResponseDto = z.infer<
  typeof POSOrderDetailResponseSchema
>;

// POS Order List types
export type POSOrderListItemDto = z.infer<typeof POSOrderListItemSchema>;
export type POSOrderListResponseDto = z.infer<
  typeof POSOrderListResponseSchema
>;

// POS Order Print types
export type POSOrderPrintItemDto = z.infer<typeof POSOrderPrintItemSchema>;
export type POSOrderPrintDataDto = z.infer<typeof POSOrderPrintDataSchema>;
