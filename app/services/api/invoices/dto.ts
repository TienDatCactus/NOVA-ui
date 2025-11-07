import type z from "zod";
import { InvoiceSchema } from "./invoice.schema";

const {
  InvoiceListItemSchema,
  InvoiceListResponseWithMetaSchema,
  InvoiceDetailSchema,
  InvoiceDetailItemSchema,
  PaginationMetaSchema,
} = InvoiceSchema;

// Main DTO types
export type InvoiceListItemDto = z.infer<typeof InvoiceListItemSchema>;
export type InvoiceListResponseDto = z.infer<
  typeof InvoiceListResponseWithMetaSchema
>; // Response with meta
export type InvoiceDetailDto = z.infer<typeof InvoiceDetailSchema>;
export type InvoiceDetailItemDto = z.infer<typeof InvoiceDetailItemSchema>;
export type PaginationMetaDto = z.infer<typeof PaginationMetaSchema>;
