import { z } from "zod";
import { PaymentSchema } from "~/services/api/payments/payments.schema";

///* booking related orders
const PosOrderStatusEnum = z.enum(["Open", "Completed", "Cancelled"]);
const CustomerTypeEnum = z.enum(["In-House", "Walk-In"]);

const ServiceOrderItemSchema = z.object({
  itemType: z.enum(["ServiceItem", "MenuItem"]),
  itemId: z.string().min(1),
  quantity: z.number().int().min(0),
  scheduledDate: z.string().length(10, "Ngày thực hiện dịch vụ là bắt buộc"),
  note: z.string().max(500).optional().nullable(),
});

const ServiceOrderSchema = z.object({
  services: z.array(ServiceOrderItemSchema).optional().nullable(),
  payment: PaymentSchema.ServicePaymentSchema.optional().nullable(),
});

/* ----------------------------------- */
//? POS orders

//! order list and detail
const POSOrderItemsInBookingSchema = z.object({
  id: z.string(),
  menuItemId: z.string().optional().nullable(),
  menuItemName: z.string().optional().nullable(),
  quantity: z.number().min(1).optional().nullable(), // must have at least 1
  unitPrice: z.number().min(0).optional().nullable(),
  subtotal: z.number().min(0).optional().nullable(),
  servedAt: z.string().optional().nullable(), // optional until served
});
const POSOrderBookingItemSchema = z.object({
  id: z.string().optional(),
  bookingRoomId: z.string().optional().nullable(),
  status: PosOrderStatusEnum.optional(),
  scheduledAt: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
  totalAmount: z.number().min(0),
  createdAt: z.string(),
  completedAt: z.string().optional().nullable(),
  items: z.array(POSOrderItemsInBookingSchema).optional(),
});

const POSOrderListByBookingResponseSchema = z.array(POSOrderBookingItemSchema);

//? ------------------------------------
const POSOrderItemSchema = z.object({
  id: z.string(),
  menuItemId: z.string().optional().nullable(),
  customItemName: z.string().optional().nullable(),
  itemName: z.string().optional().nullable(),
  quantity: z.number().min(0),
  unitPrice: z.number().min(0),
  servedAt: z.string().optional().nullable(),
  subtotal: z.number().min(0),
});
const POSOrderDetailSchema = z.object({
  id: z.string(),
  status: PosOrderStatusEnum,
  subtotalAmount: z.number().min(0),
  vatAmount: z.number().min(0),
  serviceChargeAmount: z.number().min(0),
  totalAmount: z.number().min(0),
  customerId: z.string().optional().nullable(),
  customerName: z.string().optional().nullable(),
  invoiceId: z.string().optional().nullable(),
  scheduledAt: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
  createdAt: z.string(),
  customerType: CustomerTypeEnum.optional(),
  bookingId: z.string().optional().nullable(),
  bookingCode: z.string().optional().nullable(),
  bookingRoomId: z.string().optional().nullable(),
  roomName: z.string().optional().nullable(),
  items: z.array(POSOrderItemSchema).optional(),
});

const POSOrderListResponseSchema = z.array(POSOrderDetailSchema);

// Alias for consistency
const POSOrderDetailResponseSchema = POSOrderDetailSchema;

//! POS order
const CreatePOSOrderRequestSchema = z.object({
  bookingId: z.string().optional().nullable(),
  bookingRoomId: z.string().optional().nullable(),
  scheduledAt: z.string().optional().nullable(),
  note: z.string().max(500).optional().nullable(),
});
const CreatePOSOrderResponseSchema = z.object({
  posOrderId: z.string(),
  status: PosOrderStatusEnum,
});

const AddSingleItemToPOSOrderRequestSchema = z.object({
  menuItemId: z.string().optional(),
  customItemName: z.string().min(2).max(100).optional(),
  customItemDescription: z.string().min(2).max(500).optional(),
  quantity: z.number().min(1),
  unitPrice: z.number().min(0),
});

const AddBatchItemsToPOSOrderRequestSchema = z.array(
  AddSingleItemToPOSOrderRequestSchema
);

//* print hien tai chua lam duoc
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

// -----------------------------------------------
//? Service Orders
const ServiceOrderStatusEnum = z.enum([
  "Scheduled",
  "Completed",
  "Cancelled",
  "NoShow",
]);

const ServiceOrderBookingItemSchema = z.object({
  id: z.string().optional(),
  bookingRoomId: z.string().optional().nullable(),
  serviceItemId: z.string().optional(),
  serviceItemName: z.string().optional(),
  serviceItemCode: z.string().optional(),
  scheduledAt: z.string().optional().nullable(),
  performedAt: z.string().optional().nullable(),
  completedAt: z.string().optional().nullable(),
  quantity: z.number().min(0).optional(),
  unitPrice: z.number().min(0).optional(),
  discountAmount: z.number().min(0).optional(),
  total: z.number().min(0).optional(),
  note: z.string().optional().nullable(),
  assignedToStaffId: z.string().optional().nullable(),
  assignedToStaffName: z.string().optional().nullable(),
  status: z.string().optional(),
  createdAt: z.string().optional(),
});

const ServiceOrderListByBookingDetailSchema = z.array(
  ServiceOrderBookingItemSchema
);

//*--------------------
const ServiceOrderListItemSchema = z.object({
  id: z.string().optional(),
  bookingId: z.string().optional(),
  serviceItemId: z.string().optional().nullable(),
  customServiceName: z.string().optional().nullable(),
  serviceName: z.string().optional(),
  quantity: z.number().min(0),
  unitPrice: z.number().min(0),
  scheduledAt: z.string().optional(),
  performedAt: z.string().optional().nullable(),
  status: ServiceOrderStatusEnum,
});

const ServiceOrderListSchema = z.array(ServiceOrderListItemSchema);

const CreateServiceOrderRequestSchema = z.object({
  bookingId: z.string().optional().nullable(),
  bookingRoomId: z.string().optional().nullable(),
  serviceItemId: z.string().optional().nullable(),
  customServiceName: z.string().min(2).max(100).optional().nullable(),
  customServiceDescription: z.string().min(2).max(500).optional().nullable(),
  scheduledAt: z.string().optional().nullable(),
  quantity: z.number().min(1),
  unitPrice: z.number().min(0),
  note: z.string().max(500).optional().nullable(),
  assignedToStaffId: z.string().optional().nullable(),
});
const CreateServiceOrderResponseSchema = z.object({
  serviceOrderId: z.string().optional(),
  serviceItemId: z.string().optional().nullable(),
  customServiceName: z.string().optional().nullable(),
  serviceItemName: z.string().optional(),
  scheduledAt: z.string().optional(),
  quantity: z.number().min(0).optional(),
  unitPrice: z.number().min(0).optional(),
  subtotalAmount: z.number().min(0).optional(),
  vatAmount: z.number().min(0).optional(),
  serviceChargeAmount: z.number().min(0).optional(),
  total: z.number().min(0).optional(),
  status: ServiceOrderStatusEnum,
});
const UpdateServiceOrderRequestSchema = z.object({
  scheduledAt: z.string().optional().nullable(),
  quantity: z.number().min(1).optional(),
  note: z.string().max(500).optional().nullable(),
  assignedToStaffId: z.string().optional().nullable(),
});

const ServiceOrderDetailSchema = z.object({
  id: z.string(),
  bookingId: z.string(),
  bookingRoomId: z.string().optional().nullable(),
  serviceItemId: z.string(),
  customServiceName: z.string().optional().nullable(),
  serviceItemName: z.string(),
  serviceItemCode: z.string(),
  scheduledAt: z.string().optional().nullable(),
  performedAt: z.string().optional().nullable(),
  completedAt: z.string().optional().nullable(),
  quantity: z.number().min(1),
  unitPrice: z.number().min(0),
  discountAmount: z.number().min(0),
  subtotalAmount: z.number().min(0),
  vatAmount: z.number().min(0),
  serviceChargeAmount: z.number().min(0),
  total: z.number().min(0),
  note: z.string().optional().nullable(),
  assignedToStaffId: z.string().optional().nullable(),
  status: ServiceOrderStatusEnum,
  source: z.string().optional().nullable(),
  createdAt: z.string(),
});

const OrderPayNowRequestSchema = z.object({
  paymentMethod: PaymentSchema.PaymentMethodEnum,
  paidAmount: z.number().min(0),
  transactionReference: z.string().optional().nullable(),
  successUrl: z.string().optional(),
  cancelUrl: z.string().optional(),
  description: z.string().optional(),
});

const POSOrderPayNowResponseSchema = z.object({
  invoiceId: z.string(),
  invoiceNo: z.string(),
  total: z.number().min(0),
  status: z.string(),
  // Payment redirect fields
  paymentId: z.string().optional().nullable(),
  paymentUrl: z.string().optional().nullable(),
  requiresPaymentAction: z.boolean().default(false),
  paymentProvider: z.string().optional().nullable(),
  message: z.string().optional(),
});

const SetScheduledServiceOrderRequestSchema = z.object({
  scheduledAt: z.string(),
});

const ServiceOrderPayNowResponseSchema = z.object({
  invoiceId: z.string(),
  invoiceNo: z.string(),
  total: z.number().min(0),
  status: z.string(),
  // Payment redirect fields
  paymentId: z.string().optional().nullable(),
  paymentUrl: z.string().optional().nullable(),
  requiresPaymentAction: z.boolean().default(false),
  paymentProvider: z.string().optional().nullable(),
  message: z.string().optional(),
});

const CreatePOSOrderWithItemsRequestSchema = CreatePOSOrderRequestSchema.extend(
  {
    items: AddBatchItemsToPOSOrderRequestSchema,
  }
);
export const OrderSchema = {
  // 🔹 Generic service order creation/payment
  ServiceOrderSchema,
  ServiceOrderItemSchema,

  // 🔹 POS Orders
  AddSingleItemToPOSOrderRequestSchema,
  AddBatchItemsToPOSOrderRequestSchema,
  PosOrderStatusEnum,
  CustomerTypeEnum,
  POSOrderListResponseSchema,
  POSOrderItemSchema,
  POSOrderDetailSchema,
  POSOrderDetailResponseSchema,
  POSOrderPrintItemSchema,
  POSOrderPrintDataSchema,
  CreatePOSOrderRequestSchema,
  POSOrderPayNowResponseSchema,
  POSOrderListByBookingResponseSchema,
  CreatePOSOrderWithItemsRequestSchema,

  //  Service Orders
  ServiceOrderListSchema,
  ServiceOrderListByBookingDetailSchema,
  ServiceOrderStatusEnum,
  CreateServiceOrderRequestSchema,
  UpdateServiceOrderRequestSchema,
  ServiceOrderDetailSchema,
  OrderPayNowRequestSchema,
  ServiceOrderPayNowResponseSchema,
  SetScheduledServiceOrderRequestSchema,
  CreatePOSOrderResponseSchema,
  CreateServiceOrderResponseSchema,
  ServiceOrderListItemSchema,
};
