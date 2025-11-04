"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import type { ReviewPaymentFormData } from "~/services/types/forms.types";
import { useCreateBookingStore } from "~/store/create-booking.store";
import { useServiceOrderStore } from "~/store/service-order.store";

import { Button } from "~/components/ui/button";
import { Form } from "~/components/ui/form";
import { onError } from "~/lib/utils";
import useCreateBookingMutation from "../../container/create-booking-mutation.hooks";
import { BookingPayment } from "../../fragments/booking-payment";
import { BookingSummaryCard } from "../../fragments/booking-summary.card";
import { ServiceOrder } from "../../fragments/service-order";
import { useRoomsDetailsByIds } from "~/routes/rooms/container/rooms/query.hooks";
import { FormSchema } from "~/services/schema/forms.schema";
import { usePreviewBookingPrice } from "../../container/create-booking-query.hooks";
import type { StaffBookingPricePreviewRequestDto } from "~/services/api/booking/dto";
import { format } from "date-fns";

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
  const serviceOrderServices = useServiceOrderStore((s) => s.services);
  const replaceAllServices = useServiceOrderStore((s) => s.replaceAll);
  const {
    mutateAsync,
    data: bookingResponseData,
    isPending: isSubmitting,
  } = useCreateBookingMutation();
  const { ReviewPaymentFormSchema } = FormSchema;

  const form = useForm<ReviewPaymentFormData>({
    resolver: zodResolver(ReviewPaymentFormSchema),
    defaultValues: {
      specialRequest: storeData.specialRequest ?? "",
      overridePrice: storeData.overridePrice,
      roomPayment: storeData.roomPayment ?? undefined,
      serviceOrder: { services: [] }, // Empty - managed by global store
    },
    mode: "onChange",
  });

  // Initialize service order store ONLY on mount from storeData
  useEffect(() => {
    if (
      storeData.serviceOrder?.services &&
      storeData.serviceOrder.services.length > 0
    ) {
      replaceAllServices(storeData.serviceOrder.services);
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync form fields (NOT service order) when storeData changes
  useEffect(() => {
    form.setValue("specialRequest", storeData.specialRequest ?? "");
    form.setValue("overridePrice", storeData.overridePrice);
    form.setValue("roomPayment", storeData.roomPayment ?? undefined);
  }, [
    storeData.specialRequest,
    storeData.overridePrice,
    storeData.roomPayment,
    form,
  ]);

  const roomIds = storeData.roomIds ?? [];
  const { data: selectedRoomDetails, isError: isRoomDetailsError } =
    useRoomsDetailsByIds(roomIds);

  // Validate room IDs - alert if any rooms failed to load
  useEffect(() => {
    if (
      isRoomDetailsError ||
      (roomIds.length > 0 &&
        selectedRoomDetails &&
        selectedRoomDetails.length < roomIds.length)
    ) {
      toast.error(
        "Một số phòng đã chọn không hợp lệ. Vui lòng quay lại bước 2 để chọn lại phòng."
      );
    }
  }, [roomIds, selectedRoomDetails, isRoomDetailsError]);

  const selectedRooms = useMemo(() => {
    if (!selectedRoomDetails || selectedRoomDetails.length === 0)
      return [] as {
        roomId: string;
        roomName: string;
        roomTypeName: string;
        baseRatePerNight: number;
        roomTypeId: string;
      }[];
    return selectedRoomDetails.map((d) => ({
      roomId: d.roomId,
      roomName: d.roomName,
      roomTypeName: d.roomTypeName,
      baseRatePerNight: d.dailyPrice,
      roomTypeId: d.roomTypeId,
    }));
  }, [selectedRoomDetails]);

  // Use services directly from store instead of form
  const previewRequest = useMemo<StaffBookingPricePreviewRequestDto>(() => {
    const roomTypeMap = new Map<string, number>();
    selectedRooms.forEach((room) => {
      const count = roomTypeMap.get(room.roomTypeId) || 0;
      roomTypeMap.set(room.roomTypeId, count + 1);
    });

    const roomTypes = Array.from(roomTypeMap.entries()).map(
      ([roomTypeId, quantity]) => ({
        roomTypeId,
        quantity,
      })
    );

    return {
      checkinDate: format(storeData.checkinDate || new Date(), "yyyy-MM-dd"),
      checkoutDate: format(storeData.checkoutDate || new Date(), "yyyy-MM-dd"),
      adultsAmount: storeData.adultsAmount || 1,
      childrenAmount: storeData.childrenAmount || 0,
      roomTypes,
      isBreakfastAll: storeData.isBreakfastAll || false,
      breakfastDates:
        storeData.breakfastDates?.map((date) => format(date, "yyyy-MM-dd")) ||
        [],
      services: serviceOrderServices.map((s) => ({
        itemType: s.itemType,
        itemId: s.itemId,
        quantity: s.quantity,
        scheduledDate: s.scheduledDate,
        note: s.note || "",
      })),
    };
  }, [
    storeData.checkinDate,
    storeData.checkoutDate,
    storeData.adultsAmount,
    storeData.childrenAmount,
    storeData.isBreakfastAll,
    storeData.breakfastDates,
    selectedRooms,
    serviceOrderServices,
  ]);

  const { data: pricePreview, isLoading: isLoadingPrice } =
    usePreviewBookingPrice(previewRequest);

  // Extract server-side calculated total for final calculation
  const serverTotalAmount = pricePreview?.total ?? 0;

  const getFinalTotal = () => {
    const override = form.watch("overridePrice");
    return override && !isNaN(Number(override)) && Number(override) > 0
      ? Number(override)
      : serverTotalAmount;
  };

  const onSubmit = async (data: ReviewPaymentFormData) => {
    // Use services from global store instead of form
    const finalServiceOrder = {
      services: serviceOrderServices,
    };

    setData({
      specialRequest: data.specialRequest,
      overridePrice: data.overridePrice,
      roomPayment: data.roomPayment,
      serviceOrder: finalServiceOrder,
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
        overridePrice: data.overridePrice == 0 ? null : data.overridePrice,
        serviceOrder: {},
      };
      mutateAsync(bookingData, {
        onSuccess: () => {
          reset();
          onResetSteps && onResetSteps();
          navigate("/dashboard/reservation/bookings/list");
        },
      });
      // reset();
      // onResetSteps && onResetSteps();
      // navigate("/dashboard/reservation/bookings/list");
    } catch (error) {
      console.error("Booking creation failed:", error);
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
              pricePreview={pricePreview}
              isLoadingPrice={isLoadingPrice}
            />
          </div>

          {/* Right Column - Payment & Services */}
          <div className="lg:col-span-1 space-y-6">
            <div className="lg:sticky lg:top-6 space-y-6">
              <BookingPayment
                form={form}
                totalAmount={getFinalTotal()}
                sourceType={storeData.source}
                isLoadingPrice={isLoadingPrice}
              />

              <ServiceOrder />
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
