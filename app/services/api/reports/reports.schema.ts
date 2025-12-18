import z from "zod";

const ReservationReportsSchema = z.object({
  availableRoomsTrendData: z.array(
    z.record(z.string(), z.union([z.string(), z.number()]))
  ),
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
  dailyAvailability: z.array(
    z.object({
      date: z.string(),
      available: z.record(z.string(), z.number()),
      booked: z.record(z.string(), z.number()),
      checkin: z.record(z.string(), z.number()),
      checkout: z.record(z.string(), z.number()),
    })
  ),
});

export const ReportsSchema = {
  ReservationReportsSchema,
};
