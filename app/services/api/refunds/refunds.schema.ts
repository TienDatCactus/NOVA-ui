import { z } from "zod";
import { PaymentSchema } from "~/services/schema/payment.schema";

const CreateRefundForBookingRequestSchema = z.object({
  refundAmount: z
    .number()
    .positive()
    .min(0.01, "Số tiền refund phải lớn hơn 0"),
  refundMethod: PaymentSchema.PaymentMethodEnum,
  note: z.string().max(500, "Ghi chú tối đa 500 ký tự").optional(),
  originalPaymentId: z.string().optional(),
});

const CreateRefundForBookingResponseSchema = z.object({
  refundPaymentId: z.string(),
  bookingId: z.string(),
  bookingNumber: z.string(),
  refundedAmount: z.number().nonnegative(),
  refundMethod: PaymentSchema.PaymentMethodEnum,
  refundedAt: z.string(),
  note: z.string().optional().nullable(),
  bookingTotalPaidAmount: z.number().nonnegative(),
  bookingRemainingAmount: z.number().nonnegative(),
});

const BookingRefundHistoryItemSchema = z.object({
  refundPaymentId: z.string(),
  refundedAmount: z.number().nonnegative(),
  refundMethod: PaymentSchema.PaymentMethodEnum,
  refundedAt: z.string(),
  note: z.string().optional().nullable(),
  originalPaymentId: z.string().optional().nullable(),
});

const BookingRefundHistorySchema = z.object({
  bookingId: z.string(),
  bookingNumber: z.string(),
  totalRefundedAmount: z.number().nonnegative(),
  refunds: z.array(BookingRefundHistoryItemSchema),
});

export const RefundsSchemas = {
  CreateRefundForBookingRequestSchema,
  CreateRefundForBookingResponseSchema,
  BookingRefundHistoryItemSchema,
  BookingRefundHistorySchema,
};
