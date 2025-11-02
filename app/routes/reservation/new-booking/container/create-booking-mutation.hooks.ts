import { useMutation, useQueryClient } from "@tanstack/react-query";
import type z from "zod";
import { BookingService } from "~/services/api/booking";
import { BookingSchema } from "~/services/api/booking/booking.schema";

const { StaffCreateBookingSchema } = BookingSchema;
function useCreateBookingMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["create-booking"],
    mutationFn: async (
      bookingData: z.infer<typeof StaffCreateBookingSchema>
    ) => {
      const idempotencyKey = crypto.randomUUID();
      return await BookingService.staffCreateBooking(
        idempotencyKey,
        bookingData
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}
export default useCreateBookingMutation;
