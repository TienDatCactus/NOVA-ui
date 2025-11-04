import { type FormEvent, forwardRef, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Calendar, Users, BedDouble, Utensils } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "~/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { Badge } from "~/components/ui/badge";

import { useCreateBookingStore } from "~/store/create-booking.store";
import { useServiceOrderStore } from "~/store/service-order.store";
import useCreateBookingMutation from "~/routes/reservation/new-booking/container/create-booking-mutation.hooks";
import { FormSchema } from "~/services/schema/forms.schema";
import type { ReviewPaymentFormData } from "~/services/types/forms.types";
import { formatMoney, useCalculateNights } from "~/lib/utils";
import { useRoomsDetailsByIds } from "~/routes/rooms/container/rooms/query.hooks";

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
        roomPayment: storeData.roomPayment || undefined,
        serviceOrder: undefined, // Services come from global store
      },
    });

    // Fetch full room details for selected room IDs
    const { data: roomsDetails, isLoading: isLoadingRooms } =
      useRoomsDetailsByIds(storeData.roomIds ?? []);

    const nights = useCalculateNights({
      checkinDate: storeData.checkinDate,
      checkoutDate: storeData.checkoutDate,
    });

    // Calculate totals
    const roomTotal = useMemo(() => {
      if (!roomsDetails) return 0;
      return roomsDetails.reduce((sum, room) => {
        return sum + room.dailyPrice * nights;
      }, 0);
    }, [roomsDetails, nights]);

    const serviceTotal = useMemo(() => {
      return serviceOrderServices.reduce((sum, service) => {
        return sum + service.quantity * 0; // TODO: Get service price
      }, 0);
    }, [serviceOrderServices]);

    const breakfastTotal = useMemo(() => {
      const roomCount = roomsDetails?.length ?? 0;
      if (storeData.isBreakfastAll && roomCount > 0) {
        return roomCount * nights * 50000; // 50k per person per day
      }
      if (storeData.breakfastDates && roomCount > 0) {
        return storeData.breakfastDates.length * roomCount * 50000;
      }
      return 0;
    }, [
      storeData.isBreakfastAll,
      storeData.breakfastDates,
      roomsDetails,
      nights,
    ]);

    const calculatedTotal = roomTotal + serviceTotal + breakfastTotal;
    const finalTotal = form.watch("overridePrice") || calculatedTotal;

    const onSubmit = async (data: ReviewPaymentFormData) => {
      // Save form data to store
      setData({
        specialRequest: data.specialRequest,
        overridePrice: data.overridePrice,
        roomPayment: data.roomPayment,
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

        const response = await mutateAsync(bookingData);

        // Store booking result for Step 6 display
        setData({
          createdBookingId: response?.bookingId,
          createdBookingCode: response?.bookingCode,
        } as any);

        // Navigate to completion step after success
        onNext(() => {});
      } catch (error) {
        console.error("Booking creation failed:", error);
      }
    };

    const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      void form.handleSubmit(onSubmit)();
    };

    return (
      <Form {...form}>
        <form ref={ref} onSubmit={handleFormSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Booking Summary */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin đặt phòng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Customer Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>Khách hàng</span>
                    </div>
                    <div>
                      <p className="font-medium">{storeData.guestFullName}</p>
                      <p className="text-sm text-muted-foreground">
                        {storeData.guestPhone} • {storeData.guestEmail}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  {/* Stay Dates */}
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
                      <p className="text-sm text-muted-foreground">
                        Đang tải...
                      </p>
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
                              {
                                formatMoney(room.dailyPrice * nights)
                                  .vndFormatted
                              }
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
                              : `${storeData.breakfastDates?.length} ngày`}
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
                        {serviceOrderServices.map((service, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between text-sm"
                          >
                            <span>
                              {service.itemType === "ServiceItem"
                                ? "Dịch vụ"
                                : "Món ăn"}{" "}
                              x{service.quantity}
                            </span>
                          </div>
                        ))}
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
            </div>

            {/* Right Column - Payment */}
            <div className="lg:col-span-1 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Thanh toán</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Payment Method */}
                  <FormField
                    control={form.control}
                    name="roomPayment.paymentMethod"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Phương thức thanh toán</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="Cash" id="cash" />
                              <Label htmlFor="cash">Tiền mặt</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="Card" id="card" />
                              <Label htmlFor="card">Thẻ</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="BankTransfer" id="bank" />
                              <Label htmlFor="bank">Chuyển khoản</Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <Separator />

                  {/* Override Price */}
                  <FormField
                    control={form.control}
                    name="overridePrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Điều chỉnh giá</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder={
                              formatMoney(calculatedTotal).vndFormatted
                            }
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) => {
                              const val =
                                e.target.value === ""
                                  ? null
                                  : Number(e.target.value);
                              field.onChange(val);
                            }}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Để trống để sử dụng giá tính toán:{" "}
                          {formatMoney(calculatedTotal).vndFormatted}
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>
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
