import z from "zod";
import { PaymentSchema } from "../../schema/payment.schema";

const InvoiceStatusEnum = z
  .enum([
    "Unpaid",
    "DepositOnly",
    "Paid",
    "Overpaid",
    "PartiallyPaid",
    "Refunded",
    "Chargeback",
    "Voided",
  ])
  .or(z.string());
const InvoiceTypeEnum = z
  .enum(["Room", "POS", "Service", "Mixed"])
  .or(z.string());

//? ---------------------------------

const AddCustomItemsRequestSchema = z.object({
  customItemName: z.string(),
  description: z.string(),
  quantity: z.number(),
  unitPrice: z.number(),
  note: z.string(),
});

const ConfirmInvoicePaymentRequestSchema = z.object({
  amount: z.number(),
  paymentMethod: z.string(),
  transactionReference: z.string(),
  note: z.string(),
  paidAt: z.string(),
});

const RefundInvoiceRequestSchema = z.object({
  refundAmount: z.number(),
  reason: z.string(),
});

const InvoiceListItemSchema = z.object({
  invoiceId: z.string(),
  invoiceNo: z.string(),
  invoiceType: z.string(),
  bookingId: z.string(),
  bookingCode: z.string(),
  customerName: z.string(),
  subTotal: z.number().optional().nullable(),
  vatAmount: z.number().optional().nullable(),
  serviceChargeAmount: z.number().optional().nullable(),
  total: z.number().optional().nullable(),
  paidAmount: z.number().optional().nullable(),
  balance: z.number().optional().nullable(),
  status: InvoiceStatusEnum,
  paymentMethod: PaymentSchema.PaymentMethodEnum,
  issuedAt: z.string().optional().nullable(),
  itemCount: z.number().optional().nullable(),
});

// Pagination Meta Schema (from API response)
const PaginationMetaSchema = z.object({
  page: z.number(),
  pageSize: z.number(),
  total: z.number(),
  hasNext: z.boolean(),
});

const InvoiceListResponseSchema = z.array(InvoiceListItemSchema);

const InvoiceListResponseWithMetaSchema = z.object({
  success: z.boolean(),
  statusCode: z.number(),
  message: z.string(),
  data: z.array(InvoiceListItemSchema),
  meta: PaginationMetaSchema,
});

// Invoice Detail Item Schema
const InvoiceDetailItemSchema = z.object({
  id: z.string().optional().nullable(),
  itemType: z.string().optional().nullable(),
  itemId: z.string().optional().nullable(),
  customItemName: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  quantity: z.number().optional().nullable(),
  unitPrice: z.number().optional().nullable(),
  subtotal: z.number().optional().nullable(),
});

// Invoice Detail Schema (from GET /api/Invoices/{invoiceId})
const InvoiceDetailSchema = z.object({
  id: z.string().optional().nullable(),
  invoiceNo: z.string().optional().nullable(),
  bookingRoomId: z.string().optional().nullable(),
  subTotal: z.number().optional().nullable(),
  vatAmount: z.number().optional().nullable(),
  serviceChargeAmount: z.number().optional().nullable(),
  total: z.number().optional().nullable(),
  paymentMethod: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  issuedAt: z.string().optional().nullable(),
  items: z.array(InvoiceDetailItemSchema).optional().nullable(),
});

const InvoiceByIdResponseSchema = InvoiceDetailSchema;
const InvoiceByBookingResponseSchema = z.array(InvoiceDetailSchema);

const FinalizeInvoiceResponseSchema = z.object({
  invoiceId: z.string(),
  invoiceNo: z.string(),
  subTotal: z.number(),
  vatAmount: z.number(),
  serviceChargeAmount: z.number(),
  total: z.number(),
  status: z.string(),
  issuedAt: z.string(),
});

const CreateInvoiceFromOrdersRequestSchema = z.object({
  bookingId: z.string(),
  bookingRoomId: z.string(),
  posOrderIds: z.array(z.string()),
  serviceOrderIds: z.array(z.string()),
  selectedPosOrderItemIds: z.array(z.string()),
  discountAmount: z.number().min(0),
  taxAmount: z.number().min(0),
  note: z.string(),
});

const CreateInvoiceFromOrdersResponseSchema = z.object({
  invoiceId: z.string(),
  invoiceNo: z.string(),
  subTotal: z.number(),
  vatAmount: z.number(),
  serviceChargeAmount: z.number(),
  total: z.number(),
  paidAmount: z.number(),
  balance: z.number(),
  status: z.string(),
  itemCount: z.number(),
});

const InvoicePaymentRequestSchema = z.object({
  amount: z.number(),
  method: z.string(),
  note: z.string(),
});

const InvoicePaymentResponseSchema = z.object({
  paymentId: z.string(),
  invoiceId: z.string(),
  amount: z.number(),
  method: z.string(),
  status: z.string(),
  createdAt: z.string(),
  invoiceSummary: z.object({
    invoiceNo: z.string(),
    subTotal: z.number(),
    vatAmount: z.number(),
    serviceChargeAmount: z.number(),
    total: z.number(),
    paidAmount: z.number(),
    balance: z.number(),
    status: z.string(),
  }),
});

const PaymentsFromInvoiceResponseSchema = z.array(
  z.object({
    paymentId: z.string(),
    amount: z.number(),
    method: z.string(),
    status: z.string(),
    createdAt: z.string(),
    note: z.string(),
  })
);

//! Booking related invoices
// Legacy schemas (keep for backward compatibility)
const InvoiceItemSchema = z.object({
  invoiceId: z.string("Invoice ID không hợp lệ"),
  invoiceNo: z.string().min(1, "Mã hóa đơn không hợp lệ"),
  status: InvoiceStatusEnum,
  paymentMethod: PaymentSchema.PaymentMethodEnum,
  total: z.number().min(0, "Tổng tiền không hợp lệ"),
  paidAmount: z.number().min(0, "Số tiền thanh toán không hợp lệ"),
  remainingAmount: z.number().min(0, "Số tiền còn lại không hợp lệ"),
});

const RoomInvoiceSchema = InvoiceItemSchema;
const ServiceInvoiceSchema = InvoiceItemSchema;

const InvoicePreviewRequestSchema = z.object({
  posOrderIds: z.array(z.string()),
  serviceOrderIds: z.array(z.string()),
});

const InvoicePreviewResponseSchema = z.object({
  posOrderItems: z.array(
    z.object({
      orderId: z.string(),
      itemName: z.string(),
      quantity: z.number(),
      unitPrice: z.number(),
      amount: z.number(),
    })
  ),
  serviceOrderItems: z.array(
    z.object({
      orderId: z.string(),
      itemName: z.string(),
      quantity: z.number(),
      unitPrice: z.number(),
      amount: z.number(),
    })
  ),
  subTotal: z.number(),
  vatAmount: z.number(),
  serviceChargeAmount: z.number(),
  totalAmount: z.number(),
  totalItemCount: z.number(),
});

const InvoiceCalculateFeesResponseSchema = z.object({
  subtotalAmount: z.number().min(0),
  vatAmount: z.number().min(0),
  serviceChargeAmount: z.number().min(0),
  totalAmount: z.number().min(0),
});
export const InvoiceSchema = {
  InvoiceStatusEnum,
  InvoiceTypeEnum,
  AddCustomItemsRequestSchema,
  ConfirmInvoicePaymentRequestSchema,
  RefundInvoiceRequestSchema,
  InvoiceListItemSchema,
  PaginationMetaSchema,
  InvoiceListResponseSchema,
  InvoiceListResponseWithMetaSchema,
  InvoiceDetailItemSchema,
  InvoiceDetailSchema,
  InvoiceByIdResponseSchema,
  InvoiceByBookingResponseSchema,
  FinalizeInvoiceResponseSchema,
  CreateInvoiceFromOrdersRequestSchema,
  CreateInvoiceFromOrdersResponseSchema,
  InvoicePaymentRequestSchema,
  InvoicePaymentResponseSchema,
  PaymentsFromInvoiceResponseSchema,
  InvoiceItemSchema,
  RoomInvoiceSchema,
  ServiceInvoiceSchema,
  InvoicePreviewRequestSchema,
  InvoicePreviewResponseSchema,
  InvoiceCalculateFeesResponseSchema,
};
