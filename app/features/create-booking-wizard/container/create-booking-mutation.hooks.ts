import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import type z from "zod";
import { usePaymentRedirect } from "~/hooks/use-payment-redirect";
import { BookingService } from "~/services/api/booking";
import { BookingSchema } from "~/services/api/booking/booking.schema";

const { StaffCreateBookingSchema } = BookingSchema;
function useCreateBookingMutation() {
  const queryClient = useQueryClient();
  const { handlePaymentResponse } = usePaymentRedirect();

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
    onSuccess: (response) => {
      if (response.requiresPaymentAction) {
        handlePaymentResponse({
          paymentProvider: response.paymentProvider,
          paymentUrl: response.paymentUrl,
          requiresPaymentAction: response.requiresPaymentAction,
        });
        return;
      }

      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      toast.success("Tạo đặt phòng thành công");
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message);
      }
    },
  });
}
export default useCreateBookingMutation;
