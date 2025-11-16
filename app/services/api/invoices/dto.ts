import type z from "zod";
import { InvoiceSchema } from "./invoice.schema";

const {
  InvoiceStatusEnum,
  InvoiceTypeEnum,
  AddCustomItemsRequestSchema,
  RefundInvoiceRequestSchema,
  InvoiceListItemSchema,
  PaginationMetaSchema,
  InvoiceListResponseSchema,
  InvoiceListResponseWithMetaSchema,
  InvoiceDetailItemSchema,
  InvoiceDetailSchema,
  InvoiceByIdResponseSchema,
  InvoiceByBookingResponseSchema,
  InvoicePaymentRequestSchema,
  InvoicePaymentResponseSchema,
  PaymentsFromInvoiceResponseSchema,
  InvoiceItemSchema,
  RoomInvoiceSchema,
  ServiceInvoiceSchema,
  InvoicePreviewRequestSchema,
  InvoicePreviewResponseSchema,
  InvoiceCalculateFeesResponseSchema,
  InvoiceCalculateFeesRequestSchema,
  UpdateInvoiceRequestSchema,
  SyncInvoiceWithOrdersResponseSchema,
} = InvoiceSchema;

// Enums
export type InvoiceStatusEnum = z.infer<typeof InvoiceStatusEnum>;
export type InvoiceTypeEnum = z.infer<typeof InvoiceTypeEnum>;

// Request DTOs
export type AddCustomItemsRequestDto = z.infer<
  typeof AddCustomItemsRequestSchema
>;

export type RefundInvoiceRequestDto = z.infer<
  typeof RefundInvoiceRequestSchema
>;

export type InvoicePaymentRequestDto = z.infer<
  typeof InvoicePaymentRequestSchema
>;

// Response DTOs
export type InvoiceListItemDto = z.infer<typeof InvoiceListItemSchema>;
export type InvoiceListResponseDto = z.infer<typeof InvoiceListResponseSchema>;
export type InvoiceListResponseWithMetaDto = z.infer<
  typeof InvoiceListResponseWithMetaSchema
>;
export type InvoiceDetailDto = z.infer<typeof InvoiceDetailSchema>;
export type InvoiceDetailItemDto = z.infer<typeof InvoiceDetailItemSchema>;
export type InvoiceByIdResponseDto = z.infer<typeof InvoiceByIdResponseSchema>;
export type InvoiceByBookingResponseDto = z.infer<
  typeof InvoiceByBookingResponseSchema
>;

export type InvoicePaymentResponseDto = z.infer<
  typeof InvoicePaymentResponseSchema
>;
export type PaymentsFromInvoiceResponseDto = z.infer<
  typeof PaymentsFromInvoiceResponseSchema
>;
export type InvoiceItemDto = z.infer<typeof InvoiceItemSchema>;
export type RoomInvoiceDto = z.infer<typeof RoomInvoiceSchema>;
export type ServiceInvoiceDto = z.infer<typeof ServiceInvoiceSchema>;
export type InvoicePreviewRequestDto = z.infer<
  typeof InvoicePreviewRequestSchema
>;
export type InvoicePreviewResponseDto = z.infer<
  typeof InvoicePreviewResponseSchema
>;
export type InvoiceCalculateFeesResponseDto = z.infer<
  typeof InvoiceCalculateFeesResponseSchema
>;
export type InvoiceCalculateFeesRequestDto = z.infer<
  typeof InvoiceCalculateFeesRequestSchema
>;
export type PaginationMetaDto = z.infer<typeof PaginationMetaSchema>;

export type UpdateInvoiceRequestDto = z.infer<
  typeof UpdateInvoiceRequestSchema
>;

export type SyncInvoiceWithOrdersResponseDto = z.infer<
  typeof SyncInvoiceWithOrdersResponseSchema
>;
