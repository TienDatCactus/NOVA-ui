import { z } from "zod";
import { PaymentSchema } from "./payment.schema";

const ServiceOrderItemSchema = z.object({
  itemType: z.string().min(1),
  itemId: z.string().min(1),
  quantity: z.number().int().min(0),
  scheduledDate: z.string().length(10), // e.g. "YYYY-MM-DD"
  note: z.string().max(500).optional().nullable(),
});

const ServiceOrderSchema = z.object({
  services: z.array(ServiceOrderItemSchema).optional().nullable(),
  payment: PaymentSchema.ServicePaymentSchema.optional().nullable(),
});

/* ----------------------------------- */
// POS orders

const CreatePOSOrderRequestSchema = z.object({
  invoiceId: z.string(),
  customerId: z.string(),
});

const CreatePOSOrderResponseSchema = z.object({
  posOrderId: z.string(),
  status: z.string().min(1), // keep flexible unless status enum is defined
});

const AddItemsToPOSOrderRequestSchema = z.object({
  menuItemId: z.string(),
  quantity: z.number().int().min(0),
  unitPrice: z.number().min(0),
});

const AddItemsToPOSOrderResponseSchema = z.object({
  posOrderItemId: z.string(),
  newTotalAmount: z.number().min(0),
});

const POSOrderItemSchema = z.object({
  id: z.string(),
  menuItemId: z.string(),
  menuItemName: z.string().min(1),
  quantity: z.number().int().min(0),
  unitPrice: z.number().min(0),
  subtotal: z.number().min(0),
});

const POSOrderDetailSchema = z.object({
  id: z.string(),
  status: z.string().min(1),
  totalAmount: z.number().min(0),
  customerId: z.string(),
  invoiceId: z.string(),
  createdAt: z.string(),
  items: z.array(POSOrderItemSchema),
});

const POSOrderDetailResponseSchema = POSOrderDetailSchema;

const POSOrderListItemSchema = z.object({
  id: z.string(),
  status: z.string().min(1),
  totalAmount: z.number().min(0),
  customerId: z.string(),
  invoiceId: z.string(),
  createdAt: z.string(),
  items: z.array(POSOrderItemSchema),
});

const POSOrderListResponseSchema = z.array(POSOrderListItemSchema);

const POSOrderPrintItemSchema = z.object({
  itemName: z.string().min(1),
  quantity: z.number().int().min(0),
  notes: z.string().max(500).optional().nullable(),
});

const POSOrderPrintDataSchema = z.object({
  posOrderId: z.string(),
  orderNumber: z.string().min(1),
  createdAt: z.string(),
  items: z.array(POSOrderPrintItemSchema),
  totalAmount: z.number().min(0),
  tableNumber: z.string().min(1).optional().nullable(),
  customerName: z.string().min(1).optional().nullable(),
  roomName: z.string().min(1).optional().nullable(),
  bookingCode: z.string().min(1).optional().nullable(),
});

export const OrderSchema = {
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
};
