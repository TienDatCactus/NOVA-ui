"use client";

import { format, differenceInDays } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Users,
  BedDouble,
  Coffee,
  DollarSign,
  ChevronDown,
  PencilLine,
} from "lucide-react";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { formatMoney, handleLimitInput } from "~/lib/utils";
import { useCreateBookingStore } from "~/store/create-booking.store";
import type { UseFormReturn } from "react-hook-form";
import type { ReviewPaymentFormData } from "~/services/types/forms.types";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { Calendar } from "~/components/ui/calendar";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import { useState } from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "~/components/ui/form";
import { Skeleton } from "~/components/ui/skeleton";
import type z from "zod";
import { BookingSchema } from "~/services/api/booking/booking.schema";

const { StaffBookingPricePreviewResponseSchema } = BookingSchema;
type PricePreviewDto = z.infer<typeof StaffBookingPricePreviewResponseSchema>;

interface BookingSummaryCardProps {
  form: UseFormReturn<ReviewPaymentFormData>;
  roomsData: Array<{
    roomId: string;
    roomName: string;
    roomTypeName: string;
    baseRatePerNight: number;
  }>;
  pricePreview?: PricePreviewDto;
  isLoadingPrice?: boolean;
}

export function BookingSummaryCard({
  form,
  roomsData,
  pricePreview,
  isLoadingPrice = false,
}: BookingSummaryCardProps) {
  const { data } = useCreateBookingStore();
  const [noteOpen, setNoteOpen] = useState(true);
  const overridePrice = form.watch("overridePrice");

  // Use server-calculated values directly
  const nights = pricePreview?.nights ?? 0;
  const serverTotalAmount = pricePreview?.total ?? 0;
  const roomsSubtotal = pricePreview?.roomsSubtotal ?? 0;
  const breakfastSubtotal = pricePreview?.breakfastSubtotal ?? 0;
  const servicesSubtotal = pricePreview?.servicesSubtotal ?? 0;
  const breakfastInfo = pricePreview?.breakfast;

  const finalTotal =
    overridePrice && !isNaN(Number(overridePrice)) && Number(overridePrice) > 0
      ? Number(overridePrice)
      : serverTotalAmount;

  return (
    <div className="space-y-4">
      <Card className="border shadow-sm px-4">
        <CardHeader className="px-0">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-muted-foreground">Tên khách:</span>{" "}
                  <span className="font-medium">{data.guestFullName}</span>
                </p>
                {data.guestPhone && (
                  <p>
                    <span className="text-muted-foreground">SĐT:</span>{" "}
                    {data.guestPhone}
                  </p>
                )}
                {data.guestEmail && (
                  <p>
                    <span className="text-muted-foreground">Email:</span>{" "}
                    {data.guestEmail}
                  </p>
                )}
              </div>
            </div>

            {/* Stay Info */}
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground text-xs">
                    Ngày nhận phòng
                  </p>
                  <p className="font-medium">
                    {data.checkinDate
                      ? format(data.checkinDate, "dd/MM/yyyy", { locale: vi })
                      : "-"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-xs">
                    Ngày trả phòng
                  </p>
                  <p className="font-medium">
                    {data.checkoutDate
                      ? format(data.checkoutDate, "dd/MM/yyyy", { locale: vi })
                      : "-"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {data.adultsAmount} người lớn
                    {data.childrenAmount
                      ? `, ${data.childrenAmount} trẻ em`
                      : ""}
                  </span>
                </div>
                <Badge variant="secondary">{nights} đêm</Badge>
              </div>
            </div>
          </div>
          <CardAction>
            <Button onClick={() => setNoteOpen(!noteOpen)} variant="outline">
              Ghi chú
              <PencilLine />
            </Button>
          </CardAction>
        </CardHeader>

        {noteOpen && (
          <FormField
            control={form.control}
            name="specialRequest"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Yêu cầu đặc biệt (tùy chọn)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="VD: Phòng tầng cao, view biển, giường đôi..."
                    rows={4}
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-xs">
                  Yêu cầu sẽ được gửi đến bộ phận phòng
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </Card>

      <Separator />

      {/* Rooms */}
      <div className="flex gap-4">
        <Card className="space-y-2 p-2  flex-1 bg-white">
          <Collapsible defaultOpen>
            <CollapsibleTrigger>
              <h4 className="font-medium text-sm flex items-center gap-2">
                <BedDouble className="h-4 w-4" />
                Phòng đã chọn ({roomsData.length})
              </h4>
              <ChevronDown className="ml-2 h-4 w-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 mt-2">
              {roomsData.map((room) => {
                // Try to find server-calculated rate for this room type
                const serverRoomType = pricePreview?.rooms?.find(
                  (r) => r.roomTypeName === room.roomTypeName
                );
                const displayRate =
                  serverRoomType?.ratePerNight ?? room.baseRatePerNight;
                const displayTotal =
                  serverRoomType?.subtotal ?? displayRate * nights;

                return (
                  <div
                    key={room.roomId}
                    className="flex justify-between items-start p-2 rounded-md bg-muted/50 text-sm border-2 hover:border-primary cursor-pointer border-dashed"
                  >
                    <div>
                      <p className="font-medium">{room.roomName}</p>
                      <p className="text-xs text-muted-foreground">
                        {room.roomTypeName}
                      </p>
                    </div>
                    <div className="text-right">
                      {isLoadingPrice ? (
                        <Skeleton className="h-5 w-24" />
                      ) : (
                        <>
                          <p className="font-semibold">
                            {formatMoney(displayTotal).vndFormatted}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatMoney(displayRate).vndFormatted}/đêm
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {(data.isBreakfastAll ||
          (data.breakfastDates && data.breakfastDates.length > 0)) && (
          <Card className="flex flex-col gap-1 w-50">
            <CardHeader>
              <CardTitle>
                <h4 className="font-semibold text-sm flex items-center justify-center gap-2">
                  <Coffee className="h-4 w-4" />
                  Bữa sáng
                </h4>
              </CardTitle>
            </CardHeader>
            {/* <div className="relative">
                <Calendar
                  mode="range"
                  disabled={{
                    before: new Date(),
                  }}
                  locale={vi}
                  selected={{
                    from: data.isBreakfastAll
                      ? new Date(!!data.checkinDate ? data.checkinDate : "")
                      : data.breakfastDates
                        ? data.breakfastDates[0]
                        : undefined,
                    to: data.isBreakfastAll
                      ? new Date(!!data.checkoutDate ? data.checkoutDate : "")
                      : data.breakfastDates
                        ? new Date(
                            data.breakfastDates[data.breakfastDates.length - 1]
                          )
                        : undefined,
                  }}
                  className="rounded-lg border shadow-sm"
                />
                <div className="absolute inset-0 cursor-not-allowed" />
              </div> */}
            <CardContent className=" p-2">
              {data.isBreakfastAll ? (
                <div className="flex items-center justify-center text-sm">
                  <span>Tất cả các ngày ({nights} ngày)</span>
                </div>
              ) : (
                data.breakfastDates && (
                  <ul className="flex gap- justify-center flex-wrap text-sm ">
                    {data.breakfastDates.map((date) => (
                      <Button
                        variant="ghost"
                        size="sm"
                        key={format(date, "yyyy-MM-dd")}
                      >
                        {format(date, "dd/MM", { locale: vi })}
                      </Button>
                    ))}
                  </ul>
                )
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <Separator />

      {/* Pricing */}
      <Card>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tạm tính phòng</span>
            {isLoadingPrice ? (
              <Skeleton className="h-5 w-24" />
            ) : (
              <span className="font-medium">
                {formatMoney(roomsSubtotal).vndFormatted}
              </span>
            )}
          </div>

          {breakfastInfo && breakfastSubtotal > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Bữa sáng ({breakfastInfo.days} ngày ×{" "}
                {breakfastInfo.eligibleGuests} người)
              </span>
              {isLoadingPrice ? (
                <Skeleton className="h-5 w-24" />
              ) : (
                <span className="font-medium">
                  {formatMoney(breakfastSubtotal).vndFormatted}
                </span>
              )}
            </div>
          )}

          {servicesSubtotal > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Dịch vụ</span>
              {isLoadingPrice ? (
                <Skeleton className="h-5 w-24" />
              ) : (
                <span className="font-medium">
                  {formatMoney(servicesSubtotal).vndFormatted}
                </span>
              )}
            </div>
          )}

          {/* Override Price Input */}
          <div className="w-full flex justify-between">
            <div>
              <Label htmlFor="overridePrice" className="text-sm font-medium">
                Điều chỉnh giá (tùy chọn)
              </Label>
              <p className="text-xs text-muted-foreground">
                Để trống nếu sử dụng giá mặc định
              </p>
            </div>
            <div>
              <Input
                id="overridePrice"
                type="number"
                max={99999999}
                placeholder="Nhập giá điều chỉnh"
                defaultValue={0}
                onInput={handleLimitInput}
                min={0}
                {...form.register("overridePrice", {
                  valueAsNumber: true,
                })}
              />
              {form.formState.errors.overridePrice && (
                <p className="text-xs text-destructive mt-1">
                  {form.formState.errors.overridePrice.message}
                </p>
              )}
            </div>
          </div>

          <Separator />

          <div className="flex justify-between font-bold text-lg">
            <span>Tổng cộng</span>
            {isLoadingPrice ? (
              <Skeleton className="h-7 w-32" />
            ) : (
              <span className="text-primary">
                {formatMoney(finalTotal).vndFormatted}
              </span>
            )}
          </div>

          {Number.isFinite(Number(overridePrice)) && (
            <p className="text-xs text-muted-foreground">
              Giá gốc: {formatMoney(serverTotalAmount).vndFormatted} (đã điều
              chỉnh)
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
