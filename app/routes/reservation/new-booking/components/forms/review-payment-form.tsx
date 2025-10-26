"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router";

import { useCreateBookingStore } from "~/store/create-booking.store";
import { BookingService } from "~/services/api/booking";
import useFormSchema from "~/services/schema/forms.schema";
import type { ReviewPaymentFormData } from "~/services/types/forms.types";

import { BookingSummaryCard } from "../../fragments/booking-summary.card";
import { BookingPayment } from "../../fragments/booking-payment";
import { ServiceOrder } from "../../fragments/service-order";
import { Button } from "~/components/ui/button";
import { Form } from "~/components/ui/form";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import useCalculateNights from "../../container/useCalculateNights";

interface ReviewPaymentFormProps {
  onNext: () => void;
  onBack?: () => void;
}

export function ReviewPaymentForm({ onNext, onBack }: ReviewPaymentFormProps) {
  const navigate = useNavigate();
  const {
    data: storeData,
    selectedRooms,
    setData,
    reset,
  } = useCreateBookingStore();
  const { ReviewPaymentFormSchema } = useFormSchema();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const nights = useCalculateNights({
    checkinDate: storeData.checkinDate,
    checkoutDate: storeData.checkoutDate,
  });
  const form = useForm<ReviewPaymentFormData>({
    resolver: zodResolver(ReviewPaymentFormSchema),
    defaultValues: {
      specialRequest: storeData.specialRequest ?? "",
      overridePrice: storeData.overridePrice,
      roomPayment: storeData.roomPayment,
      serviceOrder: storeData.serviceOrder,
    },
  });

  const totalAmount = useMemo(() => {
    return selectedRooms.reduce(
      (sum, room) => sum + room.baseRatePerNight * nights,
      0
    );
  }, [selectedRooms, nights]);

  const getFinalTotal = () => {
    const override = form.watch("overridePrice");
    return override && !isNaN(Number(override)) && Number(override) > 0
      ? Number(override)
      : totalAmount;
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      setData({
        specialRequest: form.watch("specialRequest"),
        overridePrice: form.watch("overridePrice"),
        roomPayment: form.watch("roomPayment"),
        serviceOrder: form.watch("serviceOrder"),
      });
    }, 500);

    return () => clearTimeout(timeout);
  }, [
    form.watch("specialRequest"),
    form.watch("overridePrice"),
    form.watch("roomPayment"),
    form.watch("serviceOrder"),
    setData,
  ]);

  const onSubmit = async (data: ReviewPaymentFormData) => {
    setIsSubmitting(true);
    try {
      const bookingData = {
        ...storeData,
        ...data,
        source: storeData.source!,
        roomIds: storeData.roomIds ?? [],
        checkinDate: storeData.checkinDate!,
        checkoutDate: storeData.checkoutDate!,
        adultsAmount: storeData.adultsAmount!,
        childrenAmount: storeData.childrenAmount ?? 0,
        guestFullName: storeData.guestFullName!,
        isBreakfastAll: storeData.isBreakfastAll ?? false,
      };

      const response = await BookingService.staffCreateBooking(bookingData);

      toast.success(`Đặt phòng thành công! Mã: ${response.bookingCode}`, {
        description: "Chuyển hướng đến danh sách đặt phòng...",
        duration: 3000,
      });
      reset();
      setTimeout(() => {
        navigate("/dashboard/reservation/bookings");
      }, 1500);
    } catch (error) {
      console.error("Booking creation failed:", error);
      toast.error("Đặt phòng thất bại", {
        description: "Vui lòng kiểm tra lại thông tin và thử lại",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">
            Xác nhận đặt phòng & thanh toán
          </h2>
          <p className="text-muted-foreground mt-1">
            Bước 3/3 - Xem lại thông tin và hoàn tất đặt phòng
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <BookingSummaryCard
              form={form}
              roomsData={selectedRooms}
              totalAmount={totalAmount}
            />

            <div className="space-y-2">
              <Label htmlFor="specialRequest">
                Yêu cầu đặc biệt (tùy chọn)
              </Label>
              <Textarea
                id="specialRequest"
                placeholder="VD: Phòng tầng cao, view biển, giường đôi..."
                rows={4}
                {...form.register("specialRequest")}
              />
              <p className="text-xs text-muted-foreground">
                Yêu cầu sẽ được gửi đến bộ phận phòng
              </p>
            </div>
          </div>

          {/* Right Column - Payment & Services */}
          <div className="lg:col-span-1 space-y-6">
            <div className="lg:sticky lg:top-6 space-y-6">
              <BookingPayment
                form={form}
                totalAmount={getFinalTotal()}
                sourceType={storeData.source}
              />

              <ServiceOrder
                services={form.watch("serviceOrder.services") ?? []}
                onAddService={() => {
                  // Placeholder - service modal
                }}
                onRemoveService={(index) => {
                  const currentServices =
                    form.watch("serviceOrder.services") ?? [];
                  form.setValue(
                    "serviceOrder.services",
                    currentServices.filter((_, i) => i !== index)
                  );
                }}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between gap-3 pt-6 border-t">
          {onBack && (
            <Button type="button" variant="outline" onClick={onBack}>
              Quay lại
            </Button>
          )}
          <div className="flex-1" />
          <Button type="submit" disabled={isSubmitting} size="lg">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Xác nhận đặt phòng
          </Button>
        </div>
      </form>
    </Form>
  );
}
