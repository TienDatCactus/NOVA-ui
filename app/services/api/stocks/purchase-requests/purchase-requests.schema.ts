import { z } from "zod";

const PurchaseRequestStatusEnum = z.enum([
  "Draft",
  "PendingApproval",
  "Approved",
  "Rejected",
  "Fulfilled",
  "Cancelled",
]);

//? ------------------------------------
const PurchaseRequestItemSchema = z.object({
  id: z.uuid(),
  itemId: z.uuid().nullable(),
  itemCode: z.string(),
  freeTextItemName: z.string(),
  freeTextItemDescription: z.string(),
  freeTextUnitName: z.string(),
  quantity: z.number(),
  unitCost: z.number(),
  note: z.string(),
});

const PurchaseRequestListItemSchema = z.object({
  id: z.string().uuid(),
  requestNumber: z.string(),
  requestedAt: z.string().datetime(),
  status: PurchaseRequestStatusEnum,
  notes: z.string(),
  approvedBy: z.string().uuid().nullable(),
  approvedByName: z.string().nullable(),
  approvedAt: z.string().datetime().nullable(),
  isReceived: z.boolean(),
  items: z.array(PurchaseRequestItemSchema),
});

const PurchaseRequestListSchema = z.array(PurchaseRequestListItemSchema);

const CreatePurchaseItemRequestSchema = z.object({
  itemId: z.uuid().nullable().optional(),
  freeTextItemName: z.string(),
  freeTextItemDescription: z.string().optional(),
  freeTextUnitName: z.string().optional(),
  quantity: z.number().positive(),
  unitCost: z.number().nonnegative(),
  note: z.string().optional(),
});

const CreatePurchaseRequestSchema = z.object({
  notes: z.string().optional(),
  items: z.array(CreatePurchaseItemRequestSchema),
});

const PurchaseRequestDetailsSchema = PurchaseRequestListItemSchema;

const UpdatePurchaseItemRequestSchema = CreatePurchaseItemRequestSchema.extend({
  id: z.string().uuid().optional(),
});

const UpdatePurchaseRequestSchema = z.object({
  notes: z.string().optional(),
  items: z.array(UpdatePurchaseItemRequestSchema),
});

const ReceiveStockRequestSchema = z.object({
  actualCosts: z.record(z.uuid(), z.number()),
  expenseId: z.string().nullable().optional(),
  note: z.string().optional(),
});

export const PurchaseRequestsSchemas = {
  PurchaseRequestStatusEnum,
  PurchaseRequestItemSchema,
  PurchaseRequestListItemSchema,
  PurchaseRequestListSchema,
  CreatePurchaseItemRequestSchema,
  CreatePurchaseRequestSchema,
  PurchaseRequestDetailsSchema,
  UpdatePurchaseItemRequestSchema,
  UpdatePurchaseRequestSchema,
  ReceiveStockRequestSchema,
};
