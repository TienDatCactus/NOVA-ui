import type { z } from "zod";
import { OrderSchema } from "./order.schema";

const {
  ServiceOrderSchema,
  ServiceOrderItemSchema,
  AddSingleItemToPOSOrderRequestSchema,
  AddBatchItemsToPOSOrderRequestSchema,
  POSOrderItemSchema,
  POSOrderDetailSchema,
  POSOrderDetailResponseSchema,
  POSOrderPrintItemSchema,
  POSOrderPrintDataSchema,
  CreatePOSOrderRequestSchema,
  POSOrderPayNowResponseSchema,
  POSOrderListByBookingResponseSchema,
  POSOrderListResponseSchema,
  CreateServiceOrderRequestSchema,
  UpdateServiceOrderRequestSchema,
  ServiceOrderDetailSchema,
  OrderPayNowRequestSchema,
  SetScheduledServiceOrderRequestSchema,
  ServiceOrderListByBookingDetailSchema,
  CreatePOSOrderResponseSchema,
  CreateServiceOrderResponseSchema,
  ServiceOrderListSchema,
  ServiceOrderListItemSchema,
} = OrderSchema;

// Service Order types
export type ServiceOrderItemDto = z.infer<typeof ServiceOrderItemSchema>;
export type ServiceOrderDto = z.infer<typeof ServiceOrderSchema>;

// POS Order Request types
export type CreatePOSOrderRequestDto = z.infer<
  typeof CreatePOSOrderRequestSchema
>;
export type CreatePOSOrderResponseDto = z.infer<
  typeof CreatePOSOrderResponseSchema
>;

export type AddSingleItemToPOSOrderRequestDto = z.infer<
  typeof AddSingleItemToPOSOrderRequestSchema
>;
export type AddBatchItemsToPOSOrderRequestDto = z.infer<
  typeof AddBatchItemsToPOSOrderRequestSchema
>;

// POS Order Detail types
export type POSOrderItemDto = z.infer<typeof POSOrderItemSchema>;
export type POSOrderDetailDto = z.infer<typeof POSOrderDetailSchema>;
export type POSOrderDetailResponseDto = z.infer<
  typeof POSOrderDetailResponseSchema
>;

// POS Order List types
export type POSOrderListResponseDto = z.infer<
  typeof POSOrderListResponseSchema
>;
export type POSOrderListByBookingResponseDto = z.infer<
  typeof POSOrderListByBookingResponseSchema
>;

// POS Order Print types
export type POSOrderPrintItemDto = z.infer<typeof POSOrderPrintItemSchema>;
export type POSOrderPrintDataDto = z.infer<typeof POSOrderPrintDataSchema>;

// POS Order Pay Now types
export type POSOrderPayNowResponseDto = z.infer<
  typeof POSOrderPayNowResponseSchema
>;

// Service Order types
export type CreateServiceOrderRequestDto = z.infer<
  typeof CreateServiceOrderRequestSchema
>;
export type CreateServiceOrderResponseDto = z.infer<
  typeof CreateServiceOrderResponseSchema
>;

export type UpdateServiceOrderRequestDto = z.infer<
  typeof UpdateServiceOrderRequestSchema
>;

export type ServiceOrderListDto = z.infer<typeof ServiceOrderListSchema>;
export type ServiceOrderListItemDto = z.infer<
  typeof ServiceOrderListItemSchema
>;

export type ServiceOrderDetailDto = z.infer<typeof ServiceOrderDetailSchema>;

export type ServiceOrderPayNowRequestDto = z.infer<
  typeof OrderPayNowRequestSchema
>;

export type SetScheduledServiceOrderRequestDto = z.infer<
  typeof SetScheduledServiceOrderRequestSchema
>;

export type ServiceOrderListByBookingDetailDto = z.infer<
  typeof ServiceOrderListByBookingDetailSchema
>;

// Common types for both POS and Service orders
export type OrderPayNowRequestDto = z.infer<typeof OrderPayNowRequestSchema>;
