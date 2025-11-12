import type z from "zod";
import { InvoiceSchema } from "./invoice.schema";

const {
  InvoiceListItemSchema,
  InvoiceListResponseWithMetaSchema,
  InvoiceDetailSchema,
  InvoiceDetailItemSchema,
  PaginationMetaSchema,
  InvoicePreviewRequestSchema,
  InvoicePreviewResponseSchema,
  InvoiceCalculateFeesResponseSchema,
} = InvoiceSchema;

// Main DTO types
export type InvoiceListItemDto = z.infer<typeof InvoiceListItemSchema>;
export type InvoiceListResponseDto = z.infer<
  typeof InvoiceListResponseWithMetaSchema
>; // Response with meta
export type InvoiceDetailDto = z.infer<typeof InvoiceDetailSchema>;
export type InvoiceDetailItemDto = z.infer<typeof InvoiceDetailItemSchema>;
export type PaginationMetaDto = z.infer<typeof PaginationMetaSchema>;

// Invoice Preview types
export type InvoicePreviewRequestDto = z.infer<
  typeof InvoicePreviewRequestSchema
>;
export type InvoicePreviewResponseDto = z.infer<
  typeof InvoicePreviewResponseSchema
>;
export type InvoiceCalculateFeesResponseDto = z.infer<
  typeof InvoiceCalculateFeesResponseSchema
>;
