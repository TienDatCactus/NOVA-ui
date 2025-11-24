import { useMemo, useState } from "react";
import { type UseFormReturn } from "react-hook-form";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  BedDouble,
  CreditCard,
  Edit2,
  Utensils,
  Wallet,
  X,
  CircleAlert,
  Loader2,
} from "lucide-react";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";

import { formatMoney, useCalculateNights } from "~/lib/utils";
import { useRoomsDetailsByIds } from "~/routes/rooms/container/rooms/query.hooks";
import { usePreviewBookingPrice } from "../container/create-booking-query.hooks";
import { useServiceOrderStore } from "~/store/service-order.store";
import { PAYMENT_METHODS } from "~/services/types/payment.types";
import { ScrollArea } from "~/components/ui/scroll-area";

interface BookingCartWidgetProps {
  form: UseFormReturn<any>;
}

export function BookingCartWidget({ form }: BookingCartWidgetProps) {
  // 1. WATCH FORM DATA (Real-time updates)
  const roomIds = form.watch("roomIds") || [];
  const dateRange = form.watch("dateRange");
  const bookingType = form.watch("bookingType");
  const isBreakfastAll = form.watch("isBreakfastAll");
  const breakfastDates = form.watch("breakfastDates");
  const adultsAmount = form.watch("adultsAmount");
  const childrenAmount = form.watch("childrenAmount");
  const overridePrice = form.watch("overridePrice");

  // 2. GLOBAL STORES
  const serviceOrderServices = useServiceOrderStore((s) => s.services);

  // 3. CALCULATED VALUES
  const isRoomBlock = bookingType === "RoomBlock";

  const nights = useCalculateNights({
    checkinDate: dateRange?.from,
    checkoutDate: dateRange?.to,
  });

  // 4. FETCH ROOM DETAILS
  const { data: roomsDetails, isLoading: isLoadingRooms } =
    useRoomsDetailsByIds(roomIds);

  // 5. PREPARE PRICE PREVIEW REQUEST
  const previewRequest = useMemo(() => {
    // Logic group room types
    const roomTypeMap = new Map<string, number>();
    roomsDetails?.forEach((room) => {
      const count = roomTypeMap.get(room.roomTypeId) || 0;
      roomTypeMap.set(room.roomTypeId, count + 1);
    });

    const roomTypes = Array.from(roomTypeMap.entries()).map(
      ([roomTypeId, quantity]) => ({ roomTypeId, quantity })
    );

    return {
      checkinDate: dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : "",
      checkoutDate: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : "",
      adultsAmount: adultsAmount || 1,
      childrenAmount: childrenAmount || 0,
      roomTypes,
      isBreakfastAll: isBreakfastAll || false,
      breakfastDates:
        breakfastDates?.map((d: Date) => format(d, "yyyy-MM-dd")) || [],
      services: serviceOrderServices.map((s) => ({
        itemType: s.itemType,
        itemId: s.itemId,
        quantity: s.quantity,
        scheduledDate: s.scheduledDate || "",
        note: s.note || "",
      })),
    };
  }, [
    roomsDetails,
    dateRange,
    adultsAmount,
    childrenAmount,
    isBreakfastAll,
    breakfastDates,
    serviceOrderServices,
  ]);

  // 6. FETCH PRICE PREVIEW API
  const { data: pricePreview, isLoading: isCalculating } =
    usePreviewBookingPrice(previewRequest, {
      enabled: roomIds.length > 0 && !!dateRange?.from && !!dateRange?.to,
    });

  // 7. FINALIZE TOTALS
  const serverTotal = pricePreview?.total ?? 0;
  // Logic override: Nếu có nhập override và > 0 thì dùng, ngược lại dùng giá server
  const finalTotal =
    overridePrice && Number(overridePrice) > 0
      ? Number(overridePrice)
      : serverTotal;

  // State cho popover edit giá
  const [isEditingPrice, setIsEditingPrice] = useState(false);

  return (
    <Card className="h-full border-none shadow-none flex flex-col">
      <CardHeader className="px-4 py-3 border-b bg-gray-50/50">
        <CardTitle className="text-base flex items-center gap-2">
          <Wallet className="h-4 w-4 text-primary" />
          Chi tiết thanh toán
        </CardTitle>
      </CardHeader>

      {/* SCROLLABLE CONTENT */}
      <ScrollArea className="flex-1">
        <CardContent className="p-4 space-y-6">
          {/* A. ROOMS SECTION */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm font-medium text-muted-foreground">
              <div className="flex items-center gap-2">
                <BedDouble className="h-4 w-4" />
                <span>Phòng ({roomIds.length})</span>
              </div>
              {isLoadingRooms && <Loader2 className="h-3 w-3 animate-spin" />}
            </div>

            {roomIds.length === 0 ? (
              <p className="text-xs text-muted-foreground italic pl-6">
                Chưa chọn phòng nào
              </p>
            ) : (
              <div className="space-y-2 pl-2 border-l-2 border-gray-100 ml-1">
                {roomsDetails?.map((room) => (
                  <div
                    key={room.roomId}
                    className="flex justify-between text-sm group"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{room.roomName}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {room.roomTypeName}
                      </span>
                    </div>
                    <span className="font-mono">
                      {formatMoney(room.dailyPrice * nights).vndFormatted}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* B. EXTRAS SECTION (Breakfast & Services) */}
          {!isRoomBlock && (
            <div className="space-y-3">
              {/* Breakfast */}
              {(isBreakfastAll || breakfastDates?.length > 0) && (
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Utensils className="h-4 w-4" />
                    <span>Bữa sáng</span>
                    <Badge variant="secondary" className="text-[10px] h-4 px-1">
                      {isBreakfastAll ? "All" : breakfastDates?.length}
                    </Badge>
                  </div>
                  <span className="font-mono">
                    {
                      formatMoney(pricePreview?.breakfastSubtotal ?? 0)
                        .vndFormatted
                    }
                  </span>
                </div>
              )}

              {/* Services */}
              {serviceOrderServices.length > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CreditCard className="h-4 w-4" />
                      <span>Dịch vụ</span>
                      <Badge
                        variant="secondary"
                        className="text-[10px] h-4 px-1"
                      >
                        {serviceOrderServices.length}
                      </Badge>
                    </div>
                    <span className="font-mono">
                      {
                        formatMoney(pricePreview?.servicesSubtotal ?? 0)
                          .vndFormatted
                      }
                    </span>
                  </div>
                  {/* Mini list of services */}
                  <div className="pl-6 space-y-1">
                    {serviceOrderServices.map((s, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between text-xs text-muted-foreground"
                      >
                        <span className="truncate max-w-[120px]">
                          x{s.quantity} {s.itemId}
                        </span>
                        {/* Note: Bạn cần logic map itemId -> name ở đây nếu muốn hiển thị tên đẹp */}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* C. ROOM BLOCK WARNING */}
          {isRoomBlock && (
            <Alert variant="destructive" className="py-2">
              <CircleAlert className="h-4 w-4" />
              <AlertTitle className="text-xs font-semibold">
                Room Block
              </AlertTitle>
              <AlertDescription className="text-xs">
                Giá phòng mặc định là 0đ.
              </AlertDescription>
            </Alert>
          )}

          {/* D. SPECIAL REQUEST */}
          <FormField
            control={form.control}
            name="specialRequest"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs uppercase text-muted-foreground font-bold">
                  Ghi chú / Yêu cầu
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Ghi chú nội bộ hoặc yêu cầu của khách..."
                    className="min-h-[80px] bg-white resize-none text-sm"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </CardContent>
      </ScrollArea>

      {/* FOOTER: TOTAL & ACTIONS */}
      <div className="p-4 bg-white border-t space-y-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
        {/* Total Row */}
        <div className="flex items-end justify-between">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-muted-foreground">
              Tổng cộng
            </span>
            {/* Override Indicator */}
            {overridePrice && Number(overridePrice) > 0 && (
              <span className="text-[10px] text-orange-600 line-through">
                Gốc: {formatMoney(serverTotal).vndFormatted}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Override Button */}
            {!isRoomBlock && (
              <Popover open={isEditingPrice} onOpenChange={setIsEditingPrice}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-primary"
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-60 p-3" align="end">
                  <FormField
                    control={form.control}
                    name="overridePrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">
                          Điều chỉnh giá tổng
                        </FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input
                              type="number"
                              placeholder={serverTotal.toString()}
                              {...field}
                              value={field.value ?? ""}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value ? Number(e.target.value) : null
                                )
                              }
                            />
                          </FormControl>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => field.onChange(null)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </FormItem>
                    )}
                  />
                </PopoverContent>
              </Popover>
            )}

            {/* Final Price Display */}
            <div className="text-right">
              {isCalculating ? (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              ) : (
                <span className="text-2xl font-bold text-primary">
                  {formatMoney(finalTotal).vndFormatted}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {!isRoomBlock && (
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full border-dashed border-primary/50 text-primary hover:bg-primary/5"
              >
                <Wallet className="mr-2 h-4 w-4" />
                Thanh toán trước (Cọc)
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>Ghi nhận thanh toán trước</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <FormField
                  control={form.control}
                  name="roomPayment.paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phương thức</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn phương thức" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PAYMENT_METHODS.map((m) => (
                            <SelectItem key={m.value} value={m.value}>
                              {m.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                {form.watch("roomPayment.paymentMethod") && (
                  <FormField
                    control={form.control}
                    name="roomPayment.paidAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số tiền</FormLabel>
                        <FormControl>
                          <Input type="number" max={finalTotal} {...field} />
                        </FormControl>
                        <FormDescription>
                          Tối đa: {formatMoney(finalTotal).vndFormatted}
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <DialogFooter>
                <DialogTrigger asChild>
                  <Button>Lưu thông tin</Button>
                </DialogTrigger>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </Card>
  );
}
