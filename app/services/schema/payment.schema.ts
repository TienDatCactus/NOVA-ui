import z from "zod";

const PaymentMethodEnum = z.enum([
  "Unknown",
  "Cash",
  "Card",
  "BankTransfer",
  "OTACollect",
  "OTAPrepaid",
  "OnAccount",
]);

const PaymentStatusEnum = z.enum(
  [
    "Unpaid",
    "DepositOnly",
    "PartiallyPaid",
    "Paid",
    "Overpaid",
    "Refunded",
    "Chargeback",
    "Voided",
  ],
  "Phương thức thanh toán không hợp lệ"
);
const RoomPaymentSchema = z.object({
  paymentMethod: PaymentMethodEnum.optional().nullable(),
  paidAmount: z
    .number("Số tiền đã thanh toán không hợp lệ")
    .optional()
    .nullable(),
  paymentNote: z.string().optional().nullable(),
});
const ServicePaymentSchema = RoomPaymentSchema;

export const PaymentSchema = {
  PaymentMethodEnum,
  PaymentStatusEnum,
  RoomPaymentSchema,
  ServicePaymentSchema,
};
