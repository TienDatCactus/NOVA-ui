import z from "zod";

const ReservationReportsSchema = z.object({
  availableRoomsTrendData: z.array(z.record(z.string(), z.string())),
  availableRoomsByType: z.array(
    z.object({
      type: z.string(),
      value: z.number(),
    })
  ),
  roomTypeComparisonData: z.array(
    z.object({
      type: z.string(),
      available: z.number(),
      booked: z.number(),
      checkin: z.number(),
    })
  ),
  bookingData: z.array(
    z.object({
      date: z.string(),
      booked: z.number(),
      checkin: z.number(),
      checkout: z.number(),
      available: z.number(),
    })
  ),
});

export const ReportsSchema = {
  ReservationReportsSchema,
};
