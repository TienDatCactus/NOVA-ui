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
  itemCode: z.string().nullable(),
  freeTextItemName: z.string(),
  freeTextItemDescription: z.string().optional().nullable(),
  freeTextUnitName: z.string(),
  quantity: z.number(),
  unitCost: z.number(),
  note: z.string(),
});

const PurchaseRequestListItemSchema = z.object({
  id: z.uuid(),
  requestNumber: z.string(),
  requestedAt: z.string(),
  status: PurchaseRequestStatusEnum,
  notes: z.string(),
  approvedBy: z.string().nullable(),
  approvedByName: z.string().nullable(),
  approvedAt: z.string().nullable(),
  isReceived: z.boolean(),
  items: z.array(PurchaseRequestItemSchema),
});

const PurchaseRequestListSchema = z.array(PurchaseRequestListItemSchema);

const CreatePurchaseItemRequestSchema = z.object({
  itemId: z.uuid("Mã định danh hàng hóa không hợp lệ").nullable().optional(),
  freeTextItemName: z
    .string("Vui lòng nhập tên hàng hóa")
    .min(1, "Tên hàng hóa không được để trống"),
  freeTextItemDescription: z.string("Mô tả không hợp lệ").optional(),
  freeTextUnitName: z.string("Đơn vị không hợp lệ").optional(),
  quantity: z
    .number("Số lượng không hợp lệ")
    .positive("Số lượng phải lớn hơn 0"),
  unitCost: z.number("Đơn giá không hợp lệ").nonnegative("Giá không được âm"),
  note: z.string("Ghi chú không hợp lệ").optional(),
});

const CreatePurchaseRequestSchema = z.object({
  notes: z.string().optional(),
  items: z.array(CreatePurchaseItemRequestSchema),
});

const PurchaseRequestDetailsSchema = PurchaseRequestListItemSchema;

const UpdatePurchaseItemRequestSchema = CreatePurchaseItemRequestSchema.extend({
  id: z.uuid().optional(),
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
