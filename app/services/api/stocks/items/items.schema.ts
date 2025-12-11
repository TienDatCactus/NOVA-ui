import { z } from "zod";

const TransactionTypesEnum = z.enum([
  "OpeningBalance",
  "PurchaseIn",
  "ConsumptionOut",
  "AdjustmentIn",
  "AdjustmentOut",
]);
const TransactionSourceTypesEnum = z.enum([
  "Manual",
  "PosOrder",
  "PurchaseRequest",
  "StockAdjustment",
]);

//?----------------------------------

const StockItemsListItemSchema = z.object({
  id: z.uuid(),
  code: z.string(),
  name: z.string(),
  description: z.string().optional().nullable(),
  categoryId: z.uuid(),
  categoryName: z.string(),
  unitId: z.uuid(),
  unitCode: z.string(),
  unitName: z.string(),
  unitCost: z.number(),
  unitPrice: z.number(),
  minStock: z.number().optional().nullable(),
  maxStock: z.number().optional().nullable(),
  isActive: z.boolean(),
  currentStock: z.number().optional().nullable(),
  averageCost: z.number().optional().nullable(),
});

const StockItemsListSchema = z.array(StockItemsListItemSchema);

const StockCreateItemSchema = z.object({
  code: z.string("Mã item là bắt buộc"),
  name: z.string("Tên hàng hóa là bắt buộc"),
  description: z.string().optional(),
  categoryId: z.uuid("Danh mục là bắt buộc"),
  unitId: z.uuid("Đơn vị tính là bắt buộc"),
  unitCost: z.number("Giá vốn là bắt buộc"),
  unitPrice: z.number("Giá bán là bắt buộc"),
  minStock: z.number("Tồn kho tối thiểu là bắt buộc"),
  maxStock: z.number("Tồn kho tối đa là bắt buộc"),
  initialQuantity: z.number("Số lượng ban đầu là bắt buộc"),
});

const StockUpdateItemSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  categoryId: z.uuid(),
  unitId: z.uuid(),
  unitCost: z.number(),
  unitPrice: z.number(),
  minStock: z.number(),
  maxStock: z.number(),
  isActive: z.boolean(),
});

const StockItemDetailsSchema = StockItemsListItemSchema;

const StockTransactionsItemSchema = z.object({
  id: z.uuid(),
  itemId: z.uuid(),
  itemCode: z.string(),
  itemName: z.string(),
  transactionType: TransactionTypesEnum,
  quantity: z.number(),
  costPrice: z.number(),
  transactionDate: z.string(),
  reference: z.string(),
  note: z.string(),
  sourceType: TransactionSourceTypesEnum,
  sourceId: z.uuid().nullable(),
  expenseId: z.uuid().nullable(),
});

const StockTransactionsResponseSchema = z.array(StockTransactionsItemSchema);

const StockAdjustRequestSchema = z.object({
  quantityDiff: z.number(),
  reason: z.string(),
});

export const StockItemsSchemas = {
  StockItemsListSchema,
  StockItemsListItemSchema,
  StockCreateItemSchema,
  StockUpdateItemSchema,
  StockItemDetailsSchema,
  StockTransactionsItemSchema,
  StockTransactionsResponseSchema,
  StockAdjustRequestSchema,
  TransactionTypesEnum,
  TransactionSourceTypesEnum,
};
