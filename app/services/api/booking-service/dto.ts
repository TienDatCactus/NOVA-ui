import type z from "zod";
import useBookingSchema from "~/services/schema/booking.schema";

const { BookingListResponseSchema } = useBookingSchema();

type BookingListResponseDto = z.infer<typeof BookingListResponseSchema>;
export type { BookingListResponseDto };
