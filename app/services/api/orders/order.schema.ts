import { z } from "zod";
import { PaymentSchema } from "~/services/schema/payment.schema";

const PosOrderStatusEnum = z.enum(["Open", "Completed", "Cancelled"]);

const ServiceOrderItemSchema = z.object({
  itemType: z.enum(["ServiceItem", "MenuItem"]),
  itemId: z.string().min(1),
  quantity: z.number().int().min(0),
  scheduledDate: z.string().length(10).optional().nullable(),
  note: z.string().max(500).optional().nullable(),
});

const ServiceOrderSchema = z.object({
  services: z.array(ServiceOrderItemSchema).optional().nullable(),
  payment: PaymentSchema.ServicePaymentSchema.optional().nullable(),
});

/* ----------------------------------- */
//? POS orders

const CreatePOSOrderRequestSchema = z.object({
  bookingId: z.string().optional().nullable(),
  bookingRoomId: z.string().optional().nullable(),
  servedAt: z.string().optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

const CreatePOSOrderResponseSchema = z.object({
  posOrderId: z.string(),
  status: z.string().min(1), // keep flexible unless status enum is defined
});

const AddItemsToPOSOrderRequestSchema = z.object({
  // only for menu
  menuItemId: z.string().optional(),
  customItemName: z.string().min(2).max(100).optional(),
  customItemDescription: z.string().min(2).max(500).optional(),
  quantity: z.number().min(1),
  unitPrice: z.number().min(0),
});

const AddItemsToPOSOrderResponseSchema = z.object({
  posOrderItemId: z.string(),
  newTotalAmount: z.number().min(0),
});

const POSOrderItemSchema = z.object({
  id: z.string(),
  itemType: z.string().optional(),
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
  note: z.string().max(500).optional().nullable(),
  scheduledAt: z.string().optional().nullable(),
  items: z.array(POSOrderItemSchema).optional(),
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
  paymentMethod: PaymentSchema.PaymentMethodEnum,
  paidAmount: z.number().min(0),
  transactionReference: z.string(),
});

const POSOrdersListItemByBookingDetailSchema = z.object({
  id: z.string().optional(),
  bookingRoomId: z.string().optional().nullable(),
  status: z.string().optional(),
  scheduledAt: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
  totalAmount: z.number().min(0).optional(),
  createdAt: z.string().optional(),
  completedAt: z.string().optional().nullable(),
  items: z.array(
    z.object({
      id: z.string(),
      menuItemId: z.string(),
      menuItemName: z.string(),
      quantity: z.number().min(0),
      unitPrice: z.number().min(0),
      subtotal: z.number().min(0),
      servedAt: z.string().optional().nullable(),
    })
  ),
});
const ServiceOrdersListItemByBookingDetailSchema = z.object({
  id: z.string().optional(),
  bookingRoomId: z.string().optional(),
  serviceItemId: z.string().optional(),
  serviceItemName: z.string().optional(),
  serviceItemCode: z.string().optional(),
  scheduledAt: z.string().optional(),
  performedAt: z.string().optional(),
  completedAt: z.string().optional(),
  quantity: z.number().min(0).optional(),
  unitPrice: z.number().min(0).optional(),
  discountAmount: z.number().min(0).optional(),
  total: z.number().min(0).optional(),
  note: z.string().optional(),
  assignedToStaffId: z.string().optional(),
  assignedToStaffName: z.string().optional(),
  status: z.string().optional(),
  createdAt: z.string().optional(),
});

const POSOrderListByBookingDetailSchema = z.array(
  POSOrdersListItemByBookingDetailSchema
);
// -----------------------------------------------
//? Service Orders

const ServiceOrderStatusEnum = z.enum([
  "Scheduled",
  "Completed",
  "Cancelled",
  "NoShow",
]);

const ServiceOrderListByBookingDetailSchema = z.array(
  ServiceOrdersListItemByBookingDetailSchema
);

const CreateServiceOrderRequestSchema = z.object({
  bookingId: z.string().optional().nullable(),
  bookingRoomId: z.string().optional().nullable(),
  serviceItemId: z.string(),
  customServiceName: z.string().min(2).max(100).optional().nullable(),
  customServiceDescription: z.string().min(2).max(500).optional().nullable(),
  scheduledAt: z.string().optional().nullable(),
  quantity: z.number().min(1),
  unitPrice: z.number().min(0),
  note: z.string().max(500).optional().nullable(),
  assignedToStaffId: z.string().optional().nullable(),
});

const UpdateServiceOrderRequestSchema = z.object({
  scheduledAt: z.string().optional().nullable(),
  quantity: z.number().min(1).optional(),
  note: z.string().max(500).optional().nullable(),
  assignedToStaffId: z.string().optional().nullable(),
});

const ServiceOrderDetailSchema = z.object({
  id: z.string(),
  bookingId: z.string().optional().nullable(),
  bookingRoomId: z.string().optional().nullable(),
  serviceItemId: z.string().optional().nullable(),
  customServiceName: z.string().optional().nullable(),
  serviceItemName: z.string().optional().nullable(),
  serviceItemCode: z.string().optional().nullable(),
  scheduledAt: z.string().optional().nullable(),
  performedAt: z.string().optional().nullable(),
  completedAt: z.string().optional().nullable(),
  quantity: z.number().min(0),
  unitPrice: z.number().min(0),
  discountAmount: z.number().min(0),
  total: z.number().min(0),
  note: z.string().optional().nullable(),
  assignedToStaffId: z.string().optional().nullable(),
  assignedToStaffName: z.string().optional().nullable(),
  status: ServiceOrderStatusEnum,
  createdAt: z.string().optional().nullable(),
});

const ServiceOrderPayNowRequestSchema = z.object({
  paymentMethod: PaymentSchema.PaymentMethodEnum,
  paidAmount: z.number().min(0),
  transactionReference: z.string().optional().nullable(),
});

const SetScheduledServiceOrderRequestSchema = z.object({
  scheduledAt: z.string(),
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
  POSOrderListByBookingDetailSchema,
  POSOrdersListItemByBookingDetailSchema,
  ServiceOrderListByBookingDetailSchema,
  ServiceOrdersListItemByBookingDetailSchema,
  ServiceOrderStatusEnum,
  CreateServiceOrderRequestSchema,
  UpdateServiceOrderRequestSchema,
  ServiceOrderDetailSchema,
  ServiceOrderPayNowRequestSchema,
  SetScheduledServiceOrderRequestSchema,
};
