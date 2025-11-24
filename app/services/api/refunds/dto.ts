import type z from "zod";
import { RefundsSchemas } from "./refunds.schema";

const {
  BookingRefundHistoryItemSchema,
  BookingRefundHistorySchema,
  CreateRefundForBookingRequestSchema,
  CreateRefundForBookingResponseSchema,
} = RefundsSchemas;
// DTO types
export type CreateRefundForBookingRequestDto = z.infer<
  typeof CreateRefundForBookingRequestSchema
>;
export type CreateRefundForBookingResponseDto = z.infer<
  typeof CreateRefundForBookingResponseSchema
>;
export type BookingRefundHistoryItemDto = z.infer<
  typeof BookingRefundHistoryItemSchema
>;
export type BookingRefundHistoryDto = z.infer<
  typeof BookingRefundHistorySchema
>;
