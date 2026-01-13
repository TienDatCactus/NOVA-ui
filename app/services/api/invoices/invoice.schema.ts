import z from "zod";
import { PaymentSchema } from "../payments/payments.schema";

const InvoiceStatusEnum = z.enum([
  "Unpaid",
  "DepositOnly",
  "PartiallyPaid",
  "Paid",
  "Overpaid",
  "Refunded",
  "Chargeback",
  "Voided",
]);

const InvoiceTypeEnum = z.enum([
  "Deposit", // Hóa đơn cọc/deposit
  "RoomCharges", // Hóa đơn tiền phòng (trả trước hoặc giữa chừng)
  "ServiceCharges", // Hóa đơn dịch vụ (F&B, Spa, Laundry, etc.)
  "Checkout", // Hóa đơn checkout (tổng hợp)
]);
//? ---------------------------------

const AddCustomItemsRequestSchema = z.object({
  customItemName: z.string(),
  description: z.string(),
  quantity: z.number(),
  unitPrice: z.number(),
  note: z.string(),
});

const RefundInvoiceRequestSchema = z.object({
  refundAmount: z.number(),
  reason: z.string(),
});

const InvoiceListItemSchema = z.object({
  invoiceId: z.string().optional(),
  invoiceNo: z.string().optional(),
  invoiceType: z.string().optional(),
  bookingId: z.string().optional(),
  bookingCode: z.string().optional(),
  customerName: z.string().optional(),
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
  itemName: z.string().optional().nullable(),
  itemNameEn: z.string().optional().nullable(),
});

// Invoice Detail Schema (from GET /api/Invoices/{invoiceId})
const InvoiceDetailSchema = z.object({
  id: z.string().optional().nullable(),
  invoiceNo: z.string().optional().nullable(),
  bookingRoomId: z.string().optional().nullable(),
  invoiceType: InvoiceTypeEnum,
  subTotal: z.number().optional().nullable(),
  vatAmount: z.number().optional().nullable(),

  serviceChargeAmount: z.number().optional().nullable(),
  total: z.number().optional().nullable(),
  paidAmount: z.number().optional().nullable(),
  balance: z.number().optional().nullable(),
  paymentMethod: PaymentSchema.PaymentMethodEnum.optional().nullable(),
  status: InvoiceStatusEnum.optional().nullable(),
  issuedAt: z.string().optional().nullable(),
  items: z.array(InvoiceDetailItemSchema).optional().nullable(),
});

const InvoiceByIdResponseSchema = InvoiceDetailSchema;
const InvoiceByBookingResponseSchema = z.array(InvoiceDetailSchema);

const InvoicePaymentRequestSchema = z.object({
  amount: z
    .number("Số tiền không hợp lệ")
    .min(0, "Số tiền phải lớn hơn hoặc bằng 0"),
  method: PaymentSchema.PaymentMethodEnum,
  note: z.string("Ghi chú không hợp lệ").optional(),
  // Payment gateway redirect support
  successUrl: z.string().optional(),
  cancelUrl: z.string().optional(),
  description: z.string().optional(),
});

const InvoicePaymentResponseSchema = z.object({
  paymentId: z.string(),
  invoiceId: z.string(),
  amount: z.number(),
  method: z.string(),
  status: z.string(),
  createdAt: z.string(),
  // Payment gateway redirect fields
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
  paymentUrl: z.string().optional(),
  requiresPaymentAction: z.boolean().optional(),
  paymentProvider: z.string().optional(),
});

const PaymentsFromInvoiceResponseSchema = z.array(
  z.object({
    paymentId: z.string().nullable(),
    amount: z.number().nullable(),
    method: z.string().nullable(),
    status: z.string().nullable(),
    createdAt: z.string().nullable(),
    note: z.string().nullable(),
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
  applyVat: z.boolean().default(true),
  applyServiceCharge: z.boolean().default(true),
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
const InvoiceCalculateFeesRequestSchema = z.object({
  subtotalAmount: z.number().min(0),
  applyVat: z.boolean().default(true),
  applyServiceCharge: z.boolean().default(true),
});

const UpdateInvoiceRequestSchema = z.object({
  vatAmount: z.number("Số tiền VAT không hợp lệ").min(0).default(0).optional(),
  serviceChargeAmount: z
    .number("Số tiền phí dịch vụ không hợp lệ")
    .min(0)
    .default(0)
    .optional(),
  paymentMethod: z.string("Phương thức thanh toán không hợp lệ"),
  note: z.string("Ghi chú không hợp lệ").optional(),
});

const SyncInvoiceWithOrdersResponseSchema = z.object({
  invoiceId: z.string().optional(),
  invoiceNo: z.string().optional(),
  posOrdersAdded: z.number().optional(),
  serviceOrdersAdded: z.number().optional(),
  previousTotal: z.number().optional(),
  newTotal: z.number().optional(),
  addedAmount: z.number().optional(),
  message: z.string().optional(),
});

export const InvoiceSchema = {
  InvoiceStatusEnum,
  InvoiceTypeEnum,
  AddCustomItemsRequestSchema,
  RefundInvoiceRequestSchema,
  InvoiceListItemSchema,
  PaginationMetaSchema,
  InvoiceListResponseSchema,
  InvoiceListResponseWithMetaSchema,
  InvoiceDetailItemSchema,
  InvoiceDetailSchema,
  InvoiceByIdResponseSchema,
  InvoiceByBookingResponseSchema,
  InvoicePaymentRequestSchema,
  InvoicePaymentResponseSchema,
  PaymentsFromInvoiceResponseSchema,
  InvoiceItemSchema,
  RoomInvoiceSchema,
  ServiceInvoiceSchema,
  InvoicePreviewRequestSchema,
  InvoicePreviewResponseSchema,
  InvoiceCalculateFeesResponseSchema,
  InvoiceCalculateFeesRequestSchema,
  UpdateInvoiceRequestSchema,
  SyncInvoiceWithOrdersResponseSchema,
};
