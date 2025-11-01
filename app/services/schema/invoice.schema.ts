import z from "zod";
import { PaymentSchema } from "./payment.schema";

const InvoiceStatusEnum = z
  .enum(["Pending", "Paid", "Cancelled", "PartiallyPaid"])
  .or(z.string());
// ----------------
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

const InvoiceListItemSchema = z.object({
  invoiceNo: z.string().min(1, "Mã hóa đơn không được để trống"),
  bookingRoomId: z.string("bookingRoomId không hợp lệ"),
  total: z.number().min(0, "Tổng tiền không hợp lệ"),
  paymentMethod: z.string().min(1, "Phương thức thanh toán không hợp lệ"),
  status: z.string().min(1, "Trạng thái không hợp lệ"),
  issuedAt: z.string().min(1, "Ngày phát hành không hợp lệ"),
  details: [
    {
      itemType: z.string().min(1, "Loại mặt hàng không hợp lệ"),
      itemId: z.string("itemId không hợp lệ"),
      customItemName: z.string().min(1, "Tên mặt hàng không hợp lệ"),
      description: z.string().min(1, "Mô tả không hợp lệ"),
      quantity: z.number().min(0, "Số lượng không hợp lệ"),
      unitPrice: z.number().min(0, "Đơn giá không hợp lệ"),
      taxRate: z.number().min(0, "Thuế suất không hợp lệ"),
      subtotal: z.number().min(0, "Tổng phụ không hợp lệ"),
      taxAmount: z.number().min(0, "Số tiền thuế không hợp lệ"),
      amount: z.number().min(0, "Số tiền không hợp lệ"),
    },
  ],
});
const InvoiceListResponseSchema = z.array(InvoiceListItemSchema);

export const InvoiceSchema = {
  InvoiceItemSchema,
  InvoiceStatusEnum,
  InvoiceListResponseSchema,
  RoomInvoiceSchema,
  ServiceInvoiceSchema,
};
