import { useMutation, useQueryClient } from "@tanstack/react-query";
import type z from "zod";
import { BookingService } from "~/services/api/booking";
import useBookingSchema from "~/services/schema/booking.schema";

const { StaffCreateBookingSchema } = useBookingSchema();
function useCreateBookingMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["create-booking"],
    mutationFn: async (bookingData: z.infer<typeof StaffCreateBookingSchema>) =>
      BookingService.staffCreateBooking(bookingData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}
export default useCreateBookingMutation;
