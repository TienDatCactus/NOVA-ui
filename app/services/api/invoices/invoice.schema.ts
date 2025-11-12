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

const InvoiceListItemSchema = z.object({
  invoiceId: z.string().optional().nullable(),
  invoiceNo: z.string().optional().nullable(),
  invoiceType: z.string().optional().nullable(),
  bookingCode: z.string().optional().nullable(),
  customerName: z.string().optional().nullable(),
  total: z.number().optional().nullable(),
  paidAmount: z.number().optional().nullable(),
  balance: z.number().optional().nullable(),
  status: z.string().optional().nullable(),
  paymentMethod: z.string().optional().nullable(),
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
  id: z.string(),
  itemType: z.string(),
  itemId: z.string().optional().nullable(),
  description: z.string(),
  quantity: z.number(),
  unitPrice: z.number(),
  subtotal: z.number(),
});

// Invoice Detail Schema (from GET /api/Invoices/{invoiceId})
const InvoiceDetailSchema = z.object({
  id: z.string(),
  invoiceNo: z.string(),
  bookingRoomId: z.string(),
  total: z.number(),
  paidAmount: z.number().optional().nullable().default(0),
  balance: z.number().optional().nullable().default(0),
  status: z.string(),
  issuedAt: z.string(), // ISO date string
  items: z.array(InvoiceDetailItemSchema),
});

// Invoice Detail Response with Wrapper
const InvoiceDetailResponseSchema = z.object({
  success: z.boolean(),
  statusCode: z.number(),
  message: z.string(),
  data: InvoiceDetailSchema,
});

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
  InvoiceListItemSchema,
  InvoiceListResponseSchema,
  InvoiceListResponseWithMetaSchema,
  InvoiceDetailSchema,
  InvoiceDetailResponseSchema,
  InvoiceDetailItemSchema,
  PaginationMetaSchema,
  InvoiceItemSchema,
  RoomInvoiceSchema,
  ServiceInvoiceSchema,
  InvoicePreviewRequestSchema,
  InvoicePreviewResponseSchema,
  InvoiceCalculateFeesResponseSchema,
};
