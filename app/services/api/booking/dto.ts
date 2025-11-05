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
  StaffUpdateBookingResponseSchema,
  StaffCancelBookingResponseSchema,
  StaffChangeRoomRequestSchema,
  StaffChangeRoomResponseSchema,
  AvailableRoomsForChangeResponseSchema,
} = BookingSchema;

type StaffBookingPricePreviewRequestDto = z.infer<
  typeof StaffBookingPricePreviewRequestSchema
>;
type StaffBookingPricePreviewResponseDto = z.infer<
  typeof StaffBookingPricePreviewResponseSchema
>;
type StaffUpdateBookingRequestDto = z.infer<
  typeof StaffUpdateBookingRequestSchema
>;
type StaffUpdateBookingResponseDto = z.infer<
  typeof StaffUpdateBookingResponseSchema
>;
type StaffCancelBookingResponseDto = z.infer<
  typeof StaffCancelBookingResponseSchema
>;
type StaffChangeRoomRequestDto = z.infer<typeof StaffChangeRoomRequestSchema>;
type StaffChangeRoomResponseDto = z.infer<typeof StaffChangeRoomResponseSchema>;
type AvailableRoomsForChangeResponseDto = z.infer<
  typeof AvailableRoomsForChangeResponseSchema
>;

type BookingListResponseDto = z.infer<typeof BookingListResponseSchema>;
type BookingListByWeekResponseDto = z.infer<
  typeof BookingListByWeekResponseSchema
>;
type StaffCreateBookingDto = z.infer<typeof StaffCreateBookingSchema>;
type StaffCreateBookingResponseDto = z.infer<
  typeof StaffCreateBookingResponseSchema
>;
type BookingDetailResponseDto = z.infer<typeof BookingDetailItemSchema>;
type BookingOTAResponseDto = z.infer<typeof BookingOTAResponseSchema>;
export type {
  BookingListResponseDto,
  BookingListByWeekResponseDto,
  StaffCreateBookingDto,
  StaffCreateBookingResponseDto,
  BookingDetailResponseDto,
  BookingOTAResponseDto,
  StaffBookingPricePreviewRequestDto,
  StaffBookingPricePreviewResponseDto,
  StaffUpdateBookingRequestDto,
  StaffUpdateBookingResponseDto,
  StaffCancelBookingResponseDto,
  StaffChangeRoomRequestDto,
  StaffChangeRoomResponseDto,
  AvailableRoomsForChangeResponseDto,
};
