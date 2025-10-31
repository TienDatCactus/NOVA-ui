import type z from "zod";
import useBookingSchema from "~/services/schema/booking.schema";

const {
  BookingListResponseSchema,
  BookingListByWeekResponseSchema,
  StaffCreateBookingResponseSchema,
  StaffCreateBookingSchema,
  BookingDetailItemSchema,
  BookingOTAResponseSchema,
} = useBookingSchema();

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
};
