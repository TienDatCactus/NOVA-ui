import z from "zod";
import usePaymentSchema from "./payment.schema";

const { PaymentMethodEnum } = usePaymentSchema();
// ----------------
const InvoiceStatusEnum = z
  .enum(["Pending", "Paid", "Cancelled", "PartiallyPaid"])
  .or(z.string());
// ----------------
const InvoiceSchema = z.object({
  invoiceId: z.string("Invoice ID không hợp lệ"),
  invoiceNo: z.string().min(1, "Mã hóa đơn không hợp lệ"),
  status: InvoiceStatusEnum,
  paymentMethod: PaymentMethodEnum,
  total: z.number().min(0, "Tổng tiền không hợp lệ"),
  paidAmount: z.number().min(0, "Số tiền thanh toán không hợp lệ"),
  remainingAmount: z.number().min(0, "Số tiền còn lại không hợp lệ"),
});

const useInvoiceSchema = () => {
  return {
    InvoiceSchema,
    InvoiceStatusEnum,
  };
};
export default useInvoiceSchema;
