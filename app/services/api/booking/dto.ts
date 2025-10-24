import type z from "zod";
import useBookingSchema from "~/services/schema/booking.schema";

const {
  BookingListResponseSchema,
  ExternalCreateBookingSchema,
  ExternalBookingResponseSchema,
  BookingListByWeekResponseSchema,
  BookingItemSchema,
} = useBookingSchema();

type BookingListResponseDto = z.infer<typeof BookingListResponseSchema>;
type BookingListByWeekResponseDto = z.infer<
  typeof BookingListByWeekResponseSchema
>;
type ExternalCreateBookingDto = z.infer<typeof ExternalCreateBookingSchema>;
type ExternalBookingResponseDto = z.infer<typeof ExternalBookingResponseSchema>;
type BookingDetailResponseDto = z.infer<typeof BookingItemSchema>;

export type {
  BookingListResponseDto,
  ExternalCreateBookingDto,
  ExternalBookingResponseDto,
  BookingListByWeekResponseDto,
  BookingDetailResponseDto,
};
