import { format } from "date-fns";
import {
  BedDouble,
  Check,
  CircleAlert,
  Edit3,
  FileText,
  Loader2,
  MessageSquare,
  Receipt,
  ShieldAlert,
  Sparkles,
  Wallet,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { type UseFormReturn } from "react-hook-form";
import type z from "zod";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { ScrollArea } from "~/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import { Textarea } from "~/components/ui/textarea";

import { formatMoney, useCalculateNights } from "~/lib/utils";
import ServiceBreakfastManagerDialog from "./service-breakfast-manager-dialog";

import { cn } from "~/lib/utils";
import { useRoomsDetailsByIds } from "~/routes/rooms/container/rooms/query.hooks";
import { OrderSchema } from "~/services/api/orders/order.schema";
import { PAYMENT_METHODS } from "~/services/types/payment.types";
import { usePreviewBookingPrice } from "../container/create-booking-query.hooks";

const { ServiceOrderItemSchema } = OrderSchema;
type ServiceOrderItem = z.infer<typeof ServiceOrderItemSchema>;

interface BookingCartWidgetProps {
  form: UseFormReturn<any>;
}

export function BookingCartWidget({ form }: BookingCartWidgetProps) {
  // --- 1. DATA WATCHERS ---
  const roomIds = form.watch("roomIds") || [];
  const dateRange = form.watch("dateRange");
  const bookingType = form.watch("bookingType");
  const isBreakfastAll = form.watch("isBreakfastAll");
  const breakfastDates = form.watch("breakfastDates");
  const adultsAmount = form.watch("adultsAmount");
  const childrenAmount = form.watch("childrenAmount");
  const overridePrice = form.watch("overridePrice");
  const serviceOrderServices = form.watch("serviceOrder.services") || [];
  const specialRequest = form.watch("specialRequest");
  const internalNote = form.watch("internalNote");

  const checkinDate = dateRange?.from;
  const checkoutDate = dateRange?.to;
  const isRoomBlock = bookingType === "RoomBlock";

  // --- 2. CALCULATIONS ---
  const nights = useCalculateNights({ checkinDate, checkoutDate });
  const { data: roomsDetails, isLoading: isLoadingRooms } =
    useRoomsDetailsByIds(roomIds);

  const previewRequest = useMemo(() => {
    const roomTypeMap = new Map<string, number>();
    roomsDetails?.forEach((room) => {
      const count = roomTypeMap.get(room.roomTypeId) || 0;
      roomTypeMap.set(room.roomTypeId, count + 1);
    });
    const roomTypes = Array.from(roomTypeMap.entries()).map(
      ([roomTypeId, quantity]) => ({ roomTypeId, quantity })
    );

    return {
      checkinDate: checkinDate ? format(checkinDate, "yyyy-MM-dd") : "",
      checkoutDate: checkoutDate ? format(checkoutDate, "yyyy-MM-dd") : "",
      adultsAmount: adultsAmount || 1,
      childrenAmount: childrenAmount || 0,
      roomTypes,
      isBreakfastAll: isBreakfastAll || false,
      breakfastDates:
        breakfastDates?.map((d: Date) => format(d, "yyyy-MM-dd")) || [],
      services: serviceOrderServices.map((s: ServiceOrderItem) => ({
        itemType: s.itemType,
        itemId: s.itemId,
        quantity: s.quantity,
        scheduledDate: s.scheduledDate || "",
        note: s.note || "",
      })),
    };
  }, [
    roomsDetails,
    checkinDate,
    checkoutDate,
    adultsAmount,
    childrenAmount,
    isBreakfastAll,
    breakfastDates,
    serviceOrderServices,
  ]);

  const { data: pricePreview, isLoading: isCalculating } =
    usePreviewBookingPrice(previewRequest, {
      enabled: roomIds.length > 0 && !!checkinDate && !!checkoutDate,
    });

  const serverTotal = pricePreview?.total ?? 0;
  const finalTotal =
    overridePrice && Number(overridePrice) > 0
      ? Number(overridePrice)
      : serverTotal;
  const hasNotes = !!specialRequest || !!internalNote;

  // --- 3. LOCAL STATE ---
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);

  return (
    <Card className="flex h-full gap-0 flex-col overflow-y-auto">
      {/* === HEADER === */}
      <CardHeader className="px-4 py-0 border-b sticky top-0 z-10">
        <CardTitle className="text-sm  font-semibold justify-between text-foreground">
          <span className="text-xl">Chi tiết thanh toán</span>{" "}
        </CardTitle>
        <CardAction>
          {/* Note Trigger Button */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={hasNotes ? "info-outline" : "ghost"}
                size="sm"
                className={cn(
                  "h-8 px-2 text-xs gap-1.5 transition-colors",
                  hasNotes
                    ? "text-primary bg-primary/10 hover:bg-primary/20"
                    : "text-muted-foreground"
                )}
              >
                {hasNotes ? (
                  <FileText className="h-3.5 w-3.5 fill-current" />
                ) : (
                  <MessageSquare className="h-3.5 w-3.5" />
                )}
                {hasNotes ? "Đã có ghi chú" : "Ghi chú"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="flex flex-col">
                <div className="p-3 border-b bg-muted/30">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Ghi chú & Yêu cầu
                  </h4>
                </div>
                <ScrollArea className="max-h-[300px]">
                  <div className="p-4 space-y-4">
                    <FormField
                      control={form.control}
                      name="specialRequest"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-medium flex items-center gap-1.5 text-foreground">
                            <MessageSquare className="h-3 w-3" /> Yêu cầu của
                            khách
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="VD: Khách đến trễ, dị ứng, view đẹp..."
                              className="min-h-[80px] text-sm resize-none focus-visible:ring-primary/50"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <Separator />
                    <FormField
                      control={form.control}
                      name="internalNote"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-medium flex items-center gap-1.5 text-yellow-700 dark:text-yellow-500">
                            <ShieldAlert className="h-3 w-3" /> Ghi chú nội bộ
                            (Staff Only)
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="VD: Cần đặt cọc gấp, khách VIP..."
                              className="min-h-[80px] text-sm resize-none bg-yellow-50/50 border-yellow-200 focus-visible:ring-yellow-400/50 dark:bg-yellow-950/10 dark:border-yellow-800"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </ScrollArea>
              </div>
            </PopoverContent>
          </Popover>
        </CardAction>
      </CardHeader>

      {/* === SCROLLABLE RECEIPT AREA === */}
      <CardContent className="p-4 flex-1 space-y-6">
        {/* SECTION A: ROOM CHARGES */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <BedDouble className="h-3.5 w-3.5" /> Phòng ({roomIds.length})
            </span>
            {isLoadingRooms && (
              <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
            )}
          </div>

          {roomIds.length === 0 ? (
            <div className="py-8 text-center border-2 border-dashed rounded-lg border-muted-foreground/10 bg-background/50">
              <p className="text-xs text-muted-foreground">
                Chưa chọn phòng nào
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {roomsDetails?.map((room) => (
                <div
                  key={room.roomId}
                  className="flex justify-between text-sm items-start group"
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">
                      {room.roomName}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {room.roomTypeName}
                    </span>
                  </div>
                  <span className="font-mono text-foreground/90 tabular-nums">
                    {formatMoney(room.dailyPrice * nights).vndFormatted}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <Separator className="bg-border/40" />

        {/* SECTION B: SERVICES & BREAKFAST */}
        {!isRoomBlock && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" /> Dịch vụ & Tiện ích
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setServiceDialogOpen(true)}
                disabled={!checkinDate || !checkoutDate}
              >
                <Edit3 className="h-3.5 w-3.5" />
              </Button>
            </div>

            <div className="space-y-2.5">
              {/* Breakfast Item */}
              {(isBreakfastAll || (breakfastDates?.length ?? 0) > 0) && (
                <div className="flex justify-between text-sm items-center">
                  <span className="text-foreground/90">
                    Bữa sáng ({isBreakfastAll ? "All" : breakfastDates?.length})
                  </span>
                  <span className="font-mono tabular-nums text-foreground/90">
                    {
                      formatMoney(pricePreview?.breakfastSubtotal ?? 0)
                        .vndFormatted
                    }
                  </span>
                </div>
              )}

              {/* Service Items Summary */}
              {serviceOrderServices.length > 0 && (
                <div className="flex justify-between text-sm items-center">
                  <span className="text-foreground/90">
                    Dịch vụ <sup>x{serviceOrderServices.length}</sup>
                  </span>
                  <span className="font-mono tabular-nums text-foreground/90">
                    {
                      formatMoney(pricePreview?.servicesSubtotal ?? 0)
                        .vndFormatted
                    }
                  </span>
                </div>
              )}

              {/* Empty State Action */}
              {!isBreakfastAll &&
                (!breakfastDates || breakfastDates.length === 0) &&
                serviceOrderServices.length === 0 && (
                  <Button
                    variant="outline"
                    className="w-full border-dashed text-xs h-9 text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all"
                    onClick={() => setServiceDialogOpen(true)}
                    disabled={!checkinDate || !checkoutDate}
                  >
                    + Thêm dịch vụ
                  </Button>
                )}
            </div>

            {/* Subtotals if needed, or rely on main Total */}
            {(pricePreview?.servicesSubtotal ?? 0) > 0 &&
              serviceOrderServices.length > 0 && (
                <div className="flex justify-end pt-2">
                  <p className="text-xs text-muted-foreground">
                    Tổng dịch vụ:{" "}
                    <span className="font-mono">
                      {
                        formatMoney(pricePreview?.servicesSubtotal ?? 0)
                          .vndFormatted
                      }
                    </span>
                  </p>
                </div>
              )}
          </div>
        )}

        {isRoomBlock && (
          <div className="rounded-md bg-destructive/10 p-3 flex gap-2 text-destructive">
            <CircleAlert className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-semibold">Room Block:</span> Giá phòng mặc
              định là 0đ.
            </div>
          </div>
        )}
      </CardContent>

      {/* === FOOTER === */}
      <div className="p-4 bg-background border-t space-y-3 z-10">
        <div className="flex items-end justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-medium text-muted-foreground uppercase">
              Tổng thanh toán
            </span>
            {overridePrice && Number(overridePrice) > 0 && (
              <span className="text-[10px] text-muted-foreground line-through decoration-destructive">
                {formatMoney(serverTotal).vndFormatted}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Edit Price */}
            {!isRoomBlock && (
              <Popover open={isEditingPrice} onOpenChange={setIsEditingPrice}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-primary rounded-full"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-3" align="end">
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold">
                      Điều chỉnh giá tổng
                    </h4>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder={serverTotal.toString()}
                        value={overridePrice ?? ""}
                        onChange={(e) =>
                          form.setValue(
                            "overridePrice",
                            e.target.value ? Number(e.target.value) : null
                          )
                        }
                        className="h-8 text-sm"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => form.setValue("overridePrice", null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            )}

            {/* TOTAL AMOUNT - SUCCESS COLOR */}
            <div className="text-right min-w-[100px]">
              {isCalculating ? (
                <Loader2 className="h-5 w-5 animate-spin text-primary ml-auto" />
              ) : (
                <span className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-500">
                  {formatMoney(finalTotal).vndFormatted}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Button */}
        {!isRoomBlock && (
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant={"success"}
                className="w-full font-semibold shadow-sm"
                disabled={finalTotal <= 0}
              >
                <Wallet className="mr-2 h-4 w-4" />
                Đặt cọc
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm gap-0 p-0 outline-none overflow-hidden">
              <DialogHeader className="px-6 py-4 border-b">
                <DialogTitle className="text-base font-semibold flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-primary" />
                  Xác nhận thanh toán
                </DialogTitle>
              </DialogHeader>

              <div className="p-6 space-y-6">
                {/* 1. AMOUNT DISPLAY CARD */}
                <div className="flex flex-col items-center justify-center space-y-1 py-4 bg-emerald-50/50 border border-emerald-100 rounded-xl border-dashed">
                  <span className="text-xs font-medium text-emerald-600 uppercase tracking-wider">
                    Tổng tiền cần thu
                  </span>
                  <span className="text-3xl font-bold text-emerald-600 tracking-tight font-mono">
                    {formatMoney(finalTotal).vndFormatted}
                  </span>
                </div>

                {/* 2. PAYMENT FORM */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="roomPayment.paymentMethod"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-xs font-semibold text-muted-foreground">
                          Hình thức thanh toán
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-9">
                              <SelectValue placeholder="Chọn phương thức..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {PAYMENT_METHODS.map((m) => (
                              <SelectItem key={m.value} value={m.value}>
                                <div className="flex items-center gap-2">
                                  {/* Có thể thêm icon cho từng method nếu muốn */}
                                  <span>{m.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  {/* Chỉ hiện nhập tiền khi đã chọn phương thức */}
                  {form.watch("roomPayment.paymentMethod") && (
                    <FormField
                      control={form.control}
                      name="roomPayment.paidAmount"
                      render={({ field }) => {
                        const paid = field.value || 0;
                        const balance = finalTotal - paid;

                        return (
                          <FormItem className="space-y-3 animate-in slide-in-from-top-2 fade-in duration-300">
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between">
                                <FormLabel className="text-xs font-semibold text-muted-foreground">
                                  Số tiền thực thu
                                </FormLabel>
                                {/* QUICK ACTIONS */}
                                <div className="flex gap-1.5">
                                  <Button
                                    variant={"outline"}
                                    type="button"
                                    onClick={() =>
                                      field.onChange(
                                        Math.round(finalTotal * 0.5)
                                      )
                                    }
                                  >
                                    50%
                                  </Button>
                                  <Button
                                    variant={"outline"}
                                    type="button"
                                    onClick={() => field.onChange(finalTotal)}
                                  >
                                    100%
                                  </Button>
                                </div>
                              </div>

                              <FormControl>
                                <div className="relative">
                                  <Input
                                    type="number"
                                    placeholder="0"
                                    className="pl-3 pr-12 h-10 font-mono text-sm"
                                    max={finalTotal}
                                    {...field}
                                    onChange={(e) =>
                                      field.onChange(
                                        e.target.value
                                          ? Number(e.target.value)
                                          : null
                                      )
                                    }
                                  />
                                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium pointer-events-none">
                                    VND
                                  </span>
                                </div>
                              </FormControl>
                            </div>

                            {/* BALANCE INDICATOR */}
                            <div className="flex items-center justify-between text-xs px-1">
                              <span className="text-muted-foreground">
                                Công nợ còn lại:
                              </span>
                              <span
                                className={cn(
                                  "font-mono font-medium",
                                  balance > 0
                                    ? "text-orange-600"
                                    : "text-emerald-600"
                                )}
                              >
                                {balance > 0
                                  ? formatMoney(balance).vndFormatted
                                  : "Đã thanh toán đủ"}
                              </span>
                            </div>
                          </FormItem>
                        );
                      }}
                    />
                  )}
                </div>
              </div>

              <DialogFooter className="px-6 py-4 bg-muted/5 border-t">
                <DialogTrigger asChild>
                  <Button className="w-full font-semibold" size="lg">
                    <Check className="mr-2 h-4 w-4" />
                    Xác nhận Tạo đơn
                  </Button>
                </DialogTrigger>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <ServiceBreakfastManagerDialog
        open={serviceDialogOpen}
        onOpenChange={setServiceDialogOpen}
        form={form}
      />
    </Card>
  );
}
