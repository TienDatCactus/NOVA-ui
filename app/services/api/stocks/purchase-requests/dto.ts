import type { z } from "zod";
import { PurchaseRequestsSchemas } from "./purchase-requests.schema";

export type PurchaseRequestStatus = z.infer<
  typeof PurchaseRequestsSchemas.PurchaseRequestStatusEnum
>;

export type PurchaseRequestItemDto = z.infer<
  typeof PurchaseRequestsSchemas.PurchaseRequestItemSchema
>;

export type PurchaseRequestListItemDto = z.infer<
  typeof PurchaseRequestsSchemas.PurchaseRequestListItemSchema
>;

export type PurchaseRequestListDto = z.infer<
  typeof PurchaseRequestsSchemas.PurchaseRequestListSchema
>;

export type CreatePurchaseItemRequestDto = z.infer<
  typeof PurchaseRequestsSchemas.CreatePurchaseItemRequestSchema
>;

export type CreatePurchaseRequestDto = z.infer<
  typeof PurchaseRequestsSchemas.CreatePurchaseRequestSchema
>;

export type PurchaseRequestDetailsDto = z.infer<
  typeof PurchaseRequestsSchemas.PurchaseRequestDetailsSchema
>;

export type UpdatePurchaseItemRequestDto = z.infer<
  typeof PurchaseRequestsSchemas.UpdatePurchaseItemRequestSchema
>;

export type UpdatePurchaseRequestDto = z.infer<
  typeof PurchaseRequestsSchemas.UpdatePurchaseRequestSchema
>;

export type ReceiveStockRequestDto = z.infer<
  typeof PurchaseRequestsSchemas.ReceiveStockRequestSchema
>;
