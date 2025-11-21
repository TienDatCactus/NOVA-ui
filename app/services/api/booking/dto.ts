import type z from "zod";
import { BookingSchema } from "~/services/api/booking/booking.schema";

const {
  BookingListResponseSchema,
  BookingListByWeekResponseSchema,
  StaffCreateBookingResponseSchema,
  StaffCreateBookingSchema,
  BookingDetailItemSchema,
  BookingOTAResponseSchema,
  StaffBookingPricePreviewRequestSchema,
  StaffBookingPricePreviewResponseSchema,
  StaffUpdateBookingRequestSchema,
  UpdateBookingRoomRequestSchema,
  StaffUpdateBookingResponseSchema,
  StaffCancelBookingResponseSchema,
  StaffChangeRoomRequestSchema,
  StaffChangeRoomResponseSchema,
  AvailableRoomsForChangeResponseSchema,
  BookingPendingChargesResponseSchema,
  StaffCheckoutRequestSchema,
  StaffCheckoutMultipleRequestSchema,
  StaffAddCompletedChargesRequestSchema,
  StaffCreateCheckoutInvoiceResponseSchema,
  StaffCheckoutPaymentRequestSchema,
  UpdateBookingStatusRequestSchema,
  UpdateBookingStatusResponseSchema,
  ConfirmBookingPaymentRequestSchema,
  ConfirmBookingPaymentResponseSchema,
  OrderableBookingResponseSchema,
} = BookingSchema;

export type StaffBookingPricePreviewRequestDto = z.infer<
  typeof StaffBookingPricePreviewRequestSchema
>;
export type StaffBookingPricePreviewResponseDto = z.infer<
  typeof StaffBookingPricePreviewResponseSchema
>;
export type StaffUpdateBookingRequestDto = z.infer<
  typeof StaffUpdateBookingRequestSchema
>;
export type UpdateBookingRoomRequestDto = z.infer<
  typeof UpdateBookingRoomRequestSchema
>;
export type StaffUpdateBookingResponseDto = z.infer<
  typeof StaffUpdateBookingResponseSchema
>;
export type StaffCancelBookingResponseDto = z.infer<
  typeof StaffCancelBookingResponseSchema
>;
export type StaffChangeRoomRequestDto = z.infer<
  typeof StaffChangeRoomRequestSchema
>;
export type StaffChangeRoomResponseDto = z.infer<
  typeof StaffChangeRoomResponseSchema
>;
export type AvailableRoomsForChangeResponseDto = z.infer<
  typeof AvailableRoomsForChangeResponseSchema
>;

export type BookingListResponseDto = z.infer<typeof BookingListResponseSchema>;
export type BookingListByWeekResponseDto = z.infer<
  typeof BookingListByWeekResponseSchema
>;
export type StaffCreateBookingDto = z.infer<typeof StaffCreateBookingSchema>;
export type StaffCreateBookingResponseDto = z.infer<
  typeof StaffCreateBookingResponseSchema
>;
export type BookingDetailResponseDto = z.infer<typeof BookingDetailItemSchema>;
export type BookingOTAResponseDto = z.infer<typeof BookingOTAResponseSchema>;

export type BookingPendingChargesResponseDto = z.infer<
  typeof BookingPendingChargesResponseSchema
>;

export type StaffCheckoutRequestDto = z.infer<
  typeof StaffCheckoutRequestSchema
>;
export type StaffCheckoutMultipleRequestDto = z.infer<
  typeof StaffCheckoutMultipleRequestSchema
>;
export type StaffAddCompletedChargesRequestDto = z.infer<
  typeof StaffAddCompletedChargesRequestSchema
>;

export type StaffCreateCheckoutInvoiceResponseDto = z.infer<
  typeof StaffCreateCheckoutInvoiceResponseSchema
>;

export type StaffCheckoutPaymentRequestDto = z.infer<
  typeof StaffCheckoutPaymentRequestSchema
>;

export type UpdateBookingStatusRequestDto = z.infer<
  typeof UpdateBookingStatusRequestSchema
>;
export type UpdateBookingStatusResponseDto = z.infer<
  typeof UpdateBookingStatusResponseSchema
>;

export type ConfirmBookingPaymentRequestDto = z.infer<
  typeof ConfirmBookingPaymentRequestSchema
>;
export type ConfirmBookingPaymentResponseDto = z.infer<
  typeof ConfirmBookingPaymentResponseSchema
>;

export type OrderableBookingResponseDto = z.infer<
  typeof OrderableBookingResponseSchema
>;
