import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { RefundsService } from "~/services/api/refunds";
import type { CreateRefundForBookingRequestDto } from "~/services/api/refunds/dto";

/**
 * Hook to create a refund for a booking
 */
export function useCreateRefund(bookingId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateRefundForBookingRequestDto) =>
      await RefundsService.createBookingRefund(bookingId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["bookings-detail", bookingId],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["refund-history", bookingId],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["invoices"],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["bookings"],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["checkout-pending-charges"],
        refetchType: "active",
      });
      toast.success("Hoàn tiền đặt phòng thành công");
    },
    onError: (error) => {
      if (error instanceof AxiosError)
        toast.error(error.response?.data.message);
    },
  });
}

/**
 * Hook to fetch refund history for a booking
 */
export function useRefundHistory(
  bookingId: string,
  options: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["refund-history", bookingId],
    queryFn: async () => await RefundsService.bookingRefundHistory(bookingId),
    enabled: !!bookingId && options.enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: true,
  });
}
