"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";

import type { ReviewPaymentFormData } from "~/services/types/forms.types";
import { useCreateBookingStore } from "~/store/create-booking.store";

import { Button } from "~/components/ui/button";
import { Form } from "~/components/ui/form";
import { onError, useCalculateNights } from "~/lib/utils";
import useCreateBookingMutation from "../../container/create-booking-mutation.hooks";
import { BookingPayment } from "../../fragments/booking-payment";
import { BookingSummaryCard } from "../../fragments/booking-summary.card";
import { ServiceOrder } from "../../fragments/service-order";
import { useRoomsDetailsByIds } from "~/routes/rooms/container/rooms/query.hooks";
import { FormSchema } from "~/services/schema/forms.schema";

interface ReviewPaymentFormProps {
  onNext: () => void;
  onBack?: () => void;
  onResetSteps?: () => void;
}

export function ReviewPaymentForm({
  onNext,
  onBack,
  onResetSteps,
}: ReviewPaymentFormProps) {
  const navigate = useNavigate();
  const { data: storeData, setData, reset } = useCreateBookingStore();
  const { mutateAsync, data: bookingResponseData } = useCreateBookingMutation();
  const { ReviewPaymentFormSchema } = FormSchema;
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
      roomPayment: storeData.roomPayment ?? undefined,
      serviceOrder: storeData.serviceOrder,
    },
  });

  const roomIds = storeData.roomIds ?? [];
  const { data: selectedRoomDetails } = useRoomsDetailsByIds(roomIds);
  const selectedRooms = useMemo(() => {
    if (!selectedRoomDetails || selectedRoomDetails.length === 0)
      return [] as {
        roomId: string;
        roomName: string;
        roomTypeName: string;
        baseRatePerNight: number;
      }[];
    return selectedRoomDetails.map((d) => ({
      roomId: d.roomId,
      roomName: d.roomName,
      roomTypeName: d.roomTypeName,
      baseRatePerNight: d.dailyPrice,
    }));
  }, [selectedRoomDetails]);

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

  const onSubmit = async (data: ReviewPaymentFormData) => {
    setIsSubmitting(true);
    setData({
      specialRequest: data.specialRequest,
      overridePrice: data.overridePrice,
      roomPayment: data.roomPayment,
      serviceOrder: data.serviceOrder,
    });
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
      mutateAsync(bookingData, {
        onSuccess: (data) => {
          reset();
          onResetSteps && onResetSteps();
          navigate("/dashboard/reservation/new-booking");
        },
      });
      // reset();
      // onResetSteps && onResetSteps();
      // navigate("/dashboard/reservation/new-booking");
    } catch (error) {
      console.error("Booking creation failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, onError)}
        className="space-y-6"
      >
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
                onAddServices={(newServices) => {
                  form.setValue("serviceOrder.services", newServices, {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
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

        <div className="flex justify-between gap-3 pt-6 border-t">
          {onBack && (
            <Button type="button" variant="outline" onClick={onBack}>
              Quay lại
            </Button>
          )}
          <div>
            <Button type="submit" disabled={isSubmitting} size="lg">
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Xác nhận đặt phòng
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
