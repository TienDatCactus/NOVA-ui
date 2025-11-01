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

const PaymentStatusEnum = z.enum([
  "Unpaid",
  "DepositOnly",
  "PartiallyPaid",
  "Paid",
  "Overpaid",
  "Refunded",
  "Chargeback",
  "Voided",
]);
const RoomPaymentSchema = z.object({
  paymentMethod: PaymentMethodEnum.optional(),
  paidAmount: z.number().optional(),
  paymentNote: z.string().optional(),
});
const ServicePaymentSchema = RoomPaymentSchema;

export const PaymentSchema = {
  PaymentMethodEnum,
  PaymentStatusEnum,
  RoomPaymentSchema,
  ServicePaymentSchema,
};
