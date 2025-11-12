import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { BedDouble, Calendar, Loader2, Users, Utensils } from "lucide-react";
import { forwardRef, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import { Textarea } from "~/components/ui/textarea";

import { formatMoney, onError, useCalculateNights } from "~/lib/utils";
import { useRoomsDetailsByIds } from "~/routes/rooms/container/rooms/query.hooks";
import type { StaffBookingPricePreviewRequestDto } from "~/services/api/booking/dto";
import { FormSchema } from "~/services/schema/forms.schema";
import type { ReviewPaymentFormData } from "~/services/types/forms.types";
import { useCreateBookingStore } from "~/store/create-booking.store";
import { useServiceOrderStore } from "~/store/service-order.store";
import useCreateBookingMutation from "../container/create-booking-mutation.hooks";
import { usePreviewBookingPrice } from "../container/create-booking-query.hooks";
import ServicePopulateItem from "../fragments/service-populate-item";

const { ReviewPaymentFormSchema } = FormSchema;

interface ReviewPaymentStepProps {
  onNext: (goToNextStep: () => void) => void;
}

export default forwardRef<HTMLFormElement, ReviewPaymentStepProps>(
  function ReviewPaymentStep({ onNext }, ref) {
    const storeData = useCreateBookingStore((s) => s.data);
    const setData = useCreateBookingStore((s) => s.setData);
    const serviceOrderServices = useServiceOrderStore((s) => s.services);

    const { mutateAsync, isPending: isSubmitting } = useCreateBookingMutation();

    const form = useForm<ReviewPaymentFormData>({
      resolver: zodResolver(ReviewPaymentFormSchema),
      defaultValues: {
        specialRequest: storeData.specialRequest || "",
        overridePrice: storeData.overridePrice || null,
        serviceOrder: undefined, // Services come from global store
      },
      mode: "onChange",
    });

    const roomIds = storeData.roomIds ?? [];
    const {
      data: roomsDetails,
      isLoading: isLoadingRooms,
      isError: isRoomDetailsError,
    } = useRoomsDetailsByIds(roomIds);

    const nights = useCalculateNights({
      checkinDate: storeData.checkinDate,
      checkoutDate: storeData.checkoutDate,
    });

    useEffect(() => {
      form.setValue("specialRequest", storeData.specialRequest ?? "");
      form.setValue("overridePrice", storeData.overridePrice);
    }, [storeData.specialRequest, storeData.overridePrice, form]);

    useEffect(() => {
      if (
        isRoomDetailsError ||
        (roomIds.length > 0 &&
          roomsDetails &&
          roomsDetails.length < roomIds.length)
      ) {
        toast.error(
          "Một số phòng đã chọn không hợp lệ. Vui lòng quay lại để chọn lại phòng."
        );
      }
    }, [roomIds, roomsDetails, isRoomDetailsError]);

    const selectedRooms = useMemo(() => {
      if (!roomsDetails || roomsDetails.length === 0)
        return [] as {
          roomId: string;
          roomName: string;
          roomTypeName: string;
          baseRatePerNight: number;
          roomTypeId: string;
        }[];
      return roomsDetails.map((d) => ({
        roomId: d.roomId,
        roomName: d.roomName,
        roomTypeName: d.roomTypeName,
        baseRatePerNight: d.dailyPrice,
        roomTypeId: d.roomTypeId,
      }));
    }, [roomsDetails]);

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
        checkoutDate: format(
          storeData.checkoutDate || new Date(),
          "yyyy-MM-dd"
        ),
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
          scheduledDate: s.scheduledDate || "",
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

    const { data: pricePreview } = usePreviewBookingPrice(previewRequest, {
      enabled: selectedRooms.length > 0,
    });

    const serverTotalAmount = pricePreview?.total ?? 0;
    const roomTotal = pricePreview?.roomsSubtotal ?? 0;
    const breakfastTotal = pricePreview?.breakfastSubtotal ?? 0;
    const serviceTotal = pricePreview?.servicesSubtotal ?? 0;

    // Calculate final total (use override if set, otherwise server total)
    const getFinalTotal = () => {
      const override = form.watch("overridePrice");
      return override && !isNaN(Number(override)) && Number(override) > 0
        ? Number(override)
        : serverTotalAmount;
    };

    const finalTotal = getFinalTotal();

    const onSubmit = async (data: ReviewPaymentFormData) => {
      // Build service order from global store
      const finalServiceOrder = {
        services: serviceOrderServices,
      };

      // Save form data to store
      setData({
        specialRequest: data.specialRequest,
        overridePrice: data.overridePrice,
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
          serviceOrder: finalServiceOrder,
        };

        await mutateAsync(bookingData, {
          onSuccess: () => {
            useCreateBookingStore.getState().reset();
            useServiceOrderStore.getState().clear();
          },
        });

        onNext(() => {});
      } catch (error) {
        console.error("Booking creation failed:", error);
      }
    };

    return (
      <Form {...form}>
        <form
          ref={ref}
          onSubmit={form.handleSubmit(onSubmit, onError)}
          className="space-y-6"
        >
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin đặt phòng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Customer Info */}
                <div className="grid grid-cols-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>Khách hàng</span>
                    </div>
                    <div>
                      <p className="font-medium">{storeData.guestFullName}</p>
                      {(storeData.guestPhone || storeData.guestEmail) && (
                        <p className="text-sm text-muted-foreground">
                          {storeData.guestPhone && storeData.guestPhone}
                          {storeData.guestEmail && ` • ${storeData.guestEmail}`}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>Nhận phòng</span>
                        </div>
                        <p className="font-medium">
                          {storeData.checkinDate
                            ? format(
                                new Date(storeData.checkinDate),
                                "dd/MM/yyyy",
                                { locale: vi }
                              )
                            : "—"}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>Trả phòng</span>
                        </div>
                        <p className="font-medium">
                          {storeData.checkoutDate
                            ? format(
                                new Date(storeData.checkoutDate),
                                "dd/MM/yyyy",
                                { locale: vi }
                              )
                            : "—"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <Badge variant="secondary">{nights} đêm</Badge>
                      <span className="text-muted-foreground">
                        {storeData.adultsAmount} người lớn
                        {storeData.childrenAmount
                          ? `, ${storeData.childrenAmount} trẻ em`
                          : ""}
                      </span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Rooms */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BedDouble className="h-4 w-4" />
                    <span>
                      Phòng đã chọn ({storeData.roomIds?.length ?? 0})
                    </span>
                  </div>
                  {isLoadingRooms ? (
                    <p className="text-sm text-muted-foreground">Đang tải...</p>
                  ) : (
                    <div className="space-y-1">
                      {roomsDetails?.map((room) => (
                        <div
                          key={room.roomId}
                          className="flex justify-between text-sm"
                        >
                          <span>
                            {room.roomName} - {room.roomTypeName}
                          </span>
                          <span className="font-medium">
                            {formatMoney(room.dailyPrice * nights).vndFormatted}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Breakfast */}
                {(storeData.isBreakfastAll ||
                  (storeData.breakfastDates &&
                    storeData.breakfastDates.length > 0)) && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Utensils className="h-4 w-4" />
                        <span>Bữa sáng</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>
                          {storeData.isBreakfastAll
                            ? `Tất cả (${nights} ngày)`
                            : `${storeData.breakfastDates?.length} ngày`}{" "}
                          :{" "}
                          <span className="font-medium">
                            {storeData.breakfastDates
                              ?.map((date) => format(new Date(date), "dd/MM"))
                              .join(", ")}
                          </span>
                        </span>
                        <span className="font-medium">
                          {formatMoney(breakfastTotal).vndFormatted}
                        </span>
                      </div>
                    </div>
                  </>
                )}

                {/* Services */}
                {serviceOrderServices.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Dịch vụ ({serviceOrderServices.length})
                      </p>
                      <div className="flex flex-wrap gap-4">
                        {serviceOrderServices.map((service, idx) => (
                          <ServicePopulateItem
                            itemType={service.itemType}
                            id={service.itemId}
                            quantity={service.quantity}
                            note={service.note || ""}
                          />
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <Separator />

                {/* Total */}
                <div className="flex justify-between text-lg font-semibold">
                  <span>Tổng cộng</span>
                  <span className="text-primary">
                    {formatMoney(finalTotal).vndFormatted}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Special Request */}
            <FormField
              control={form.control}
              name="specialRequest"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Yêu cầu đặc biệt</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Nhập yêu cầu đặc biệt (nếu có)"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>
                    Các yêu cầu về phòng, giường, hoặc dịch vụ bổ sung
                  </FormDescription>
                </FormItem>
              )}
            />

            {/* Override Price */}
            <FormField
              control={form.control}
              name="overridePrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Điều chỉnh giá (Tùy chọn)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder={`Giá gốc: ${formatMoney(serverTotalAmount).vndFormatted}`}
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value === "" ? null : Number(value));
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    {field.value && Number(field.value) > 0 ? (
                      <span className="text-primary font-medium">
                        Giá sau điều chỉnh:{" "}
                        {formatMoney(Number(field.value)).vndFormatted}
                      </span>
                    ) : (
                      "Để trống để sử dụng giá mặc định từ hệ thống"
                    )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {isSubmitting && (
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Đang tạo đặt phòng...</span>
            </div>
          )}
        </form>
      </Form>
    );
  }
);
