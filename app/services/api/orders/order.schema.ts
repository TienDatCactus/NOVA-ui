import { z } from "zod";
import { PaymentSchema } from "~/services/schema/payment.schema";

const PosOrderStatusEnum = z.enum(["Open", "Completed", "Cancelled"]);

const ServiceOrderItemSchema = z.object({
  itemType: z.enum(["ServiceItem", "MenuItem"]),
  itemId: z.string().min(1),
  quantity: z.number().int().min(0),
  scheduledDate: z.string().length(10),
  note: z.string().max(500).optional().nullable(),
});

const ServiceOrderSchema = z.object({
  services: z.array(ServiceOrderItemSchema).optional().nullable(),
  payment: PaymentSchema.ServicePaymentSchema.optional().nullable(),
});

/* ----------------------------------- */
// POS orders

const CreatePOSOrderRequestSchema = z.object({
  bookingId: z.string().optional().nullable(),
  bookingRoomId: z.string().optional().nullable(),
});

const CreatePOSOrderResponseSchema = z.object({
  posOrderId: z.string(),
  status: z.string().min(1), // keep flexible unless status enum is defined
});

const AddItemsToPOSOrderRequestSchema = z.object({
  // only for menu
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
  itemType: z.string(),
  menuItemId: z.string().optional().nullable(),
  serviceItemId: z.string().optional().nullable(),
  itemName: z.string().min(1),
  quantity: z.number().min(0),
  unitPrice: z.number().min(0),
  servedAt: z.string().optional().nullable(),
  subtotal: z.number().min(0),
});

const POSOrderDetailSchema = z.object({
  id: z.string(),
  status: PosOrderStatusEnum,
  totalAmount: z.number().min(0),
  customerId: z.string().optional().nullable(),
  invoiceId: z.string().optional().nullable(),
  createdAt: z.string().optional().nullable(),
  items: z.array(POSOrderItemSchema),
});

const POSOrderDetailResponseSchema = POSOrderDetailSchema;
const POSOrderListByInvoiceResponseSchema = z.array(POSOrderDetailSchema);
const POSOrderListByBookingResponseSchema = z.array(POSOrderDetailSchema);

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

const POSOrderPayNowRequestSchema = z.object({
  paymentMethod: z.string(),
  paidAmount: z.number().min(0),
  transactionReference: z.string(),
});

export const OrderSchema = {
  ServiceOrderSchema,
  ServiceOrderItemSchema,
  POSOrderListByInvoiceResponseSchema,
  CreatePOSOrderResponseSchema,
  AddItemsToPOSOrderRequestSchema,
  AddItemsToPOSOrderResponseSchema,
  POSOrderItemSchema,
  POSOrderDetailSchema,
  POSOrderDetailResponseSchema,
  POSOrderPrintItemSchema,
  POSOrderPrintDataSchema,
  CreatePOSOrderRequestSchema,
  POSOrderPayNowRequestSchema,
  POSOrderListByBookingResponseSchema,
};
