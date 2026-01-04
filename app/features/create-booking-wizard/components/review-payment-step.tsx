import { format } from "date-fns";
import {
  BedDouble,
  Check,
  CircleAlert,
  Edit3,
  FileText,
  Loader2,
  MessageSquare,
  ShieldAlert,
  Sparkles,
  Wallet,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { type UseFormReturn } from "react-hook-form";
import type z from "zod";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Dialog,
  DialogClose,
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
import { useRoomTypes } from "~/routes/rooms/container/room-types/query.hooks";
import { useRoomsDetailsByIds } from "~/routes/rooms/container/rooms/query.hooks";
import { OrderSchema } from "~/services/api/orders/order.schema";
import { PAYMENT_METHODS } from "~/services/types/payment.types";
import { useCreateBookingStore } from "~/store/create-booking.store";
import { usePreviewBookingPrice } from "../container/create-booking-query.hooks";

const { ServiceOrderItemSchema } = OrderSchema;
type ServiceOrderItem = z.infer<typeof ServiceOrderItemSchema>;

interface BookingCartWidgetProps {
  form: UseFormReturn<any>;
}

export function BookingCartWidget({ form }: BookingCartWidgetProps) {
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const { setData } = useCreateBookingStore();

  // --- 1. DATA WATCHERS ---
  const roomIds = form.watch("roomIds") || [];
  const roomTypeRequests = form.watch("roomTypeRequests") || [];
  const dateRange = form.watch("dateRange");
  const bookingType = form.watch("bookingType");
  const includeBreakfast = form.watch("includeBreakfast");
  const adultsAmount = form.watch("adultsAmount");
  const childrenAmount = form.watch("childrenAmount");
  const overridePrice = form.watch("overridePrice");
  const serviceOrderServices = form.watch("serviceOrder.services") || [];
  const specialRequest = form.watch("specialRequest");
  const internalNote = form.watch("internalNote");

  const checkinDate = useMemo(() => dateRange?.from, [dateRange?.from]);
  const checkoutDate = useMemo(() => dateRange?.to, [dateRange?.to]);
  const isRoomBlock = useMemo(() => bookingType === "RoomBlock", [bookingType]);

  // Determine selection mode
  const selectionMode = useMemo(() => {
    const hasRoomIds = roomIds.length > 0;
    const hasRoomTypeRequests = roomTypeRequests.length > 0;

    if (hasRoomIds && hasRoomTypeRequests) {
      return "mixed"; // Should not happen, but handle it
    }

    if (hasRoomIds) return "specific";
    if (hasRoomTypeRequests) return "quantity";
    return "none";
  }, [roomIds.length, roomTypeRequests.length]);

  // --- 2. CALCULATIONS ---
  const nights = useCalculateNights({ checkinDate, checkoutDate });
  const { data: roomsDetails, isLoading: isLoadingRooms } =
    useRoomsDetailsByIds(roomIds);

  // Fetch room types for quantity mode preview
  const { data: allRoomTypes } = useRoomTypes();
  const selectedRoomTypesData = useMemo(() => {
    if (selectionMode !== "quantity" || !allRoomTypes) return [];
    const typeIds = roomTypeRequests.map((req: any) => req.roomTypeId);
    return allRoomTypes.filter((rt) => typeIds.includes(rt.id));
  }, [selectionMode, allRoomTypes, roomTypeRequests]);
  const previewRequest = useMemo(() => {
    let roomTypes: { roomTypeId: string; quantity: number }[] = [];

    if (selectionMode === "specific" && roomsDetails) {
      const roomTypeMap = new Map<string, number>();
      roomsDetails.forEach((room) => {
        const count = roomTypeMap.get(room.roomTypeId) || 0;
        roomTypeMap.set(room.roomTypeId, count + 1);
      });
      roomTypes = Array.from(roomTypeMap.entries()).map(
        ([roomTypeId, quantity]) => ({ roomTypeId, quantity })
      );
    } else if (selectionMode === "quantity") {
      // Use room type requests directly
      roomTypes = roomTypeRequests.map((req: any) => ({
        roomTypeId: req.roomTypeId,
        quantity: req.quantity,
      }));
    }

    return {
      checkinDate: checkinDate ? format(checkinDate, "yyyy-MM-dd") : "",
      checkoutDate: checkoutDate ? format(checkoutDate, "yyyy-MM-dd") : "",
      adultsAmount: adultsAmount || 1,
      childrenAmount: childrenAmount || 0,
      roomTypes,
      includeBreakfast: includeBreakfast || false,

      services: serviceOrderServices.map((s: ServiceOrderItem) => ({
        itemType: s.itemType,
        itemId: s.itemId,
        quantity: s.quantity,
        scheduledDate: s.scheduledDate || "",
        note: s.note || "",
      })),
    };
  }, [
    selectionMode,
    roomsDetails,
    roomTypeRequests,
    checkinDate,
    checkoutDate,
    adultsAmount,
    childrenAmount,
    includeBreakfast,
    serviceOrderServices,
  ]);

  const {
    data: pricePreview,
    mutate: previewBookingPrice,
    isPending: isCalculating,
    reset,
  } = usePreviewBookingPrice(previewRequest);

  useEffect(() => {
    const hasValidSelection =
      (selectionMode === "specific" && roomIds.length > 0 && !isLoadingRooms) ||
      (selectionMode === "quantity" && roomTypeRequests.length > 0);

    if (
      hasValidSelection &&
      checkinDate &&
      checkoutDate &&
      previewRequest.checkinDate &&
      previewRequest.checkoutDate &&
      previewRequest.roomTypes.length > 0
    ) {
      previewBookingPrice();
    }
    return () => {
      reset();
    };
  }, [
    selectionMode,
    roomIds.length,
    roomTypeRequests.length,
    checkinDate,
    checkoutDate,
    JSON.stringify(previewRequest.roomTypes),
    previewRequest.includeBreakfast,
    JSON.stringify(previewRequest.services),
    previewRequest.adultsAmount,
    previewRequest.childrenAmount,
    isLoadingRooms,
  ]);

  const serverTotal = useMemo(
    () => pricePreview?.total ?? 0,
    [pricePreview?.total]
  );
  const finalTotal = useMemo(
    () =>
      overridePrice && Number(overridePrice) > 0
        ? Number(overridePrice)
        : serverTotal,
    [overridePrice, serverTotal]
  );
  const hasNotes = useMemo(
    () => !!specialRequest || !!internalNote,
    [specialRequest, internalNote]
  );

  const handleRemoveRoom = useCallback(
    (roomId: string) => {
      const updatedRoomIds = roomIds.filter((id: string) => id !== roomId);
      form.setValue("roomIds", updatedRoomIds, {
        shouldValidate: true,
        shouldDirty: true,
      });
    },
    [roomIds, form]
  );

  const handleAbortDeposit = useCallback(() => {
    form.unregister("roomPayment");
    form.clearErrors("roomPayment");
    setData({
      roomPayment: undefined,
    });
  }, [form, setData]);

  return (
    <Card className="flex h-full flex-col  border-none shadow-none bg-background/50 sm:border ">
      {/* === HEADER === */}
      <CardHeader className="px-5 border-b bg-background/95 backdrop-blur sticky top-0 z-20">
        <div className="flex items-center justify-between w-full">
          <CardTitle className="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
            <span className="text-lg">Chi tiết thanh toán</span>
          </CardTitle>

          {/* Note Trigger Button */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "h-8 px-3 text-xs gap-2 transition-all border-dashed rounded-full",
                  hasNotes
                    ? "border-primary/50 text-primary bg-primary/5 hover:bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:border-border"
                )}
              >
                {hasNotes ? (
                  <FileText className="h-3.5 w-3.5 fill-current" />
                ) : (
                  <MessageSquare className="h-3.5 w-3.5" />
                )}
                {hasNotes ? "Đã có ghi chú" : "Ghi chú"}
                {hasNotes && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-80 p-0 shadow-lg border-muted"
              align="end"
            >
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
                          <FormLabel className="text-xs font-medium flex items-center gap-1.5 text-amber-600 dark:text-amber-500">
                            <ShieldAlert className="h-3 w-3" /> Ghi chú nội bộ
                            (Staff Only)
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="VD: Cần đặt cọc gấp, khách VIP..."
                              className="min-h-[80px] text-sm resize-none bg-amber-50/50 border-amber-200 focus-visible:ring-amber-400/50 dark:bg-amber-950/10 dark:border-amber-800"
                              value={field.value || ""}
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
        </div>
      </CardHeader>

      {/* === SCROLLABLE RECEIPT AREA === */}
      <CardContent className="p-5 flex-1 ">
        <div className="space-y-6 ">
          {/* SECTION A: ROOM CHARGES */}
          <div className="space-y-3 max-h-72 overflow-y-auto">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <BedDouble className="h-3.5 w-3.5" /> Phòng (
                {useMemo(
                  () =>
                    selectionMode === "specific"
                      ? roomIds.length
                      : roomTypeRequests.reduce(
                          (sum: number, req: any) => sum + req.quantity,
                          0
                        ),
                  [selectionMode, roomIds.length, roomTypeRequests]
                )}
                )
              </span>
              {isLoadingRooms && selectionMode === "specific" && (
                <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
              )}
            </div>

            {!roomsDetails ||
              (!roomTypeRequests && (
                <div className="py-10 text-center border border-dashed rounded-xl border-muted-foreground/20 bg-muted/20">
                  <p className="text-sm font-medium text-muted-foreground">
                    Chưa chọn phòng nào
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    Vui lòng chọn phòng từ danh sách
                  </p>
                </div>
              ))}
            {roomsDetails && (
              <div className="space-y-2">
                {roomsDetails?.map((room: any) => (
                  <div
                    key={room.roomId}
                    className="group flex justify-between items-start p-3 rounded-lg border bg-card/50 hover:bg-card hover:shadow-sm transition-all"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-sm text-foreground">
                        {room.roomName}
                      </span>
                      <span className="text-[11px] text-muted-foreground font-medium bg-muted w-fit px-1.5 py-0.5 rounded">
                        {room.roomTypeName}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-mono font-medium text-sm text-foreground tabular-nums mr-2">
                        {formatMoney(room.dailyPrice * nights).vndFormatted}
                      </span>
                      <Button
                        onClick={() => handleRemoveRoom(room.roomId)}
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {roomTypeRequests && (
              <div className="space-y-2">
                {roomTypeRequests?.map((req: any) => {
                  const roomTypeInfo = selectedRoomTypesData.find(
                    (rt: any) => rt.id === req.roomTypeId
                  );
                  if (!roomTypeInfo) return null;

                  const subtotal =
                    roomTypeInfo.baseRate * nights * req.quantity;
                  console.log(roomTypeInfo);
                  console.log(roomTypeRequests);

                  return (
                    <div
                      key={req.roomTypeId}
                      className="flex justify-between items-center p-3 rounded-lg border bg-card/50"
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium truncate line-clamp-1 max-w-32 text-sm text-foreground">
                          {
                            roomTypeInfo.translations.find(
                              (t) => t.languageCode === "vi"
                            )?.name
                          }
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {req.quantity} phòng × {nights} đêm
                        </span>
                      </div>
                      <span className="font-mono font-medium text-sm text-foreground tabular-nums">
                        {formatMoney(subtotal).vndFormatted}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <Separator className="bg-border/60" />

          {/* SECTION B: SERVICES & BREAKFAST */}
          {!isRoomBlock && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" /> Dịch vụ & Tiện ích
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-full hover:bg-primary/10 hover:text-primary"
                  onClick={() => setServiceDialogOpen(true)}
                  disabled={!checkinDate || !checkoutDate}
                >
                  <Edit3 className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="space-y-2">
                {/* Breakfast Item */}
                {includeBreakfast && (
                  <div className="flex justify-between items-center text-sm p-3 rounded-lg border bg-blue-50/30 border-blue-100 dark:bg-blue-900/10 dark:border-blue-900">
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-400"></span>
                      <span className="text-foreground/90 font-medium">
                        Bữa sáng{" "}
                        <span className="text-[10px] text-muted-foreground font-normal ml-1">
                          (Tự động tính)
                        </span>
                      </span>
                    </div>
                    <span className="font-mono font-medium tabular-nums text-foreground/90">
                      {
                        formatMoney(pricePreview?.breakfastSubtotal ?? 0)
                          .vndFormatted
                      }
                    </span>
                  </div>
                )}

                {/* Service Items Summary */}
                {serviceOrderServices.length > 0 && (
                  <div className="flex justify-between items-center text-sm p-3 rounded-lg border bg-purple-50/30 border-purple-100 dark:bg-purple-900/10 dark:border-purple-900">
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-purple-400"></span>
                      <span className="text-foreground/90 font-medium">
                        Dịch vụ bổ sung
                      </span>
                      <span className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                        x{serviceOrderServices.length}
                      </span>
                    </div>
                    <span className="font-mono font-medium tabular-nums text-foreground/90">
                      {
                        formatMoney(pricePreview?.servicesSubtotal ?? 0)
                          .vndFormatted
                      }
                    </span>
                  </div>
                )}

                {/* Empty State Action */}
                {!includeBreakfast && serviceOrderServices.length === 0 && (
                  <Button
                    variant="outline"
                    className="w-full border-dashed text-xs h-10 text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all"
                    onClick={() => setServiceDialogOpen(true)}
                    disabled={!checkinDate || !checkoutDate}
                  >
                    + Thêm dịch vụ hoặc bữa sáng
                  </Button>
                )}
              </div>

              {/* Subtotals if needed */}
              {(pricePreview?.servicesSubtotal ?? 0) > 0 &&
                serviceOrderServices.length > 0 && (
                  <div className="flex justify-end pt-1">
                    <p className="text-xs text-muted-foreground flex gap-2 items-center">
                      Tổng dịch vụ:{" "}
                      <span className="font-mono font-medium text-foreground">
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
            <div className="rounded-lg bg-destructive/5 border border-destructive/20 p-3 flex gap-3 text-destructive items-start">
              <CircleAlert className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="text-xs space-y-0.5">
                <span className="font-bold block text-sm">Room Block Mode</span>
                Giá phòng mặc định được đặt là 0đ cho việc giữ chỗ hoặc bảo trì.
              </div>
            </div>
          )}
        </div>
      </CardContent>

      {/* === FOOTER === */}
      <div className="p-5 bg-background border-t shadow-[0_-5px_15px_-10px_rgba(0,0,0,0.05)] z-20 space-y-4">
        <div className="flex items-end justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Tổng thanh toán
            </span>
            {overridePrice && Number(overridePrice) > 0 && (
              <span className="text-xs text-muted-foreground line-through decoration-destructive decoration-2">
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
                    className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full"
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-4" align="end">
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold">
                        Điều chỉnh giá tổng
                      </h4>
                      <p className="text-[11px] text-muted-foreground">
                        Giá này sẽ ghi đè tổng giá tự động tính toán.
                      </p>
                    </div>
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
                        className="h-9 text-sm font-mono"
                      />
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-9 w-9 shrink-0"
                        onClick={() => form.setValue("overridePrice", null)}
                        title="Reset giá gốc"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            )}

            {/* TOTAL AMOUNT - SUCCESS COLOR */}
            <div className="text-right min-w-[120px]">
              {isCalculating ? (
                <Loader2 className="h-6 w-6 animate-spin text-primary ml-auto" />
              ) : (
                <span className="text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-500 font-mono">
                  {bookingType !== "RoomBlock"
                    ? formatMoney(finalTotal).vndFormatted
                    : formatMoney(0).vndFormatted}
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
                variant="default" // Using default or a custom 'success' variant if you have it
                size="lg"
                className={cn(
                  "w-full font-semibold shadow-md transition-all hover:translate-y-[-1px]",
                  // If you have a success variant in your theme, use it. Otherwise simulating green here:
                  "bg-emerald-600 hover:bg-emerald-700 text-white"
                )}
                disabled={finalTotal <= 0}
              >
                <Wallet className="mr-2 h-5 w-5" />
                Xác nhận & Đặt cọc
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[400px] gap-0 p-0 overflow-hidden border-none shadow-2xl">
              <DialogHeader className="px-6 py-5 border-b bg-muted/20">
                <DialogTitle className="text-lg font-bold flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-emerald-600" />
                  Xác nhận thanh toán
                </DialogTitle>
              </DialogHeader>

              <div className="p-6 space-y-6">
                {/* 1. AMOUNT DISPLAY CARD */}
                <div className="flex flex-col items-center justify-center space-y-2 py-6 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-100 dark:border-emerald-800">
                  <span className="text-xs font-bold text-emerald-600/80 uppercase tracking-widest">
                    Tổng tiền cần thu
                  </span>
                  <span className="text-4xl font-bold text-emerald-600 tracking-tighter font-mono">
                    {
                      formatMoney(
                        (pricePreview?.roomsSubtotal ?? 0) +
                          (pricePreview?.breakfastSubtotal ?? 0)
                      ).vndFormatted
                    }
                  </span>
                  <span className="text-xs text-emerald-600/60 font-medium">
                    (Tiền phòng + Dịch vụ)
                  </span>
                </div>

                {/* 2. PAYMENT FORM */}
                <div className="space-y-5">
                  <FormField
                    control={form.control}
                    name="roomPayment.paymentMethod"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-sm font-semibold text-foreground">
                          Hình thức thanh toán
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full h-11 bg-background">
                              <SelectValue placeholder="Chọn phương thức..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {PAYMENT_METHODS.map((m: any) => (
                              <SelectItem key={m.value} value={m.value}>
                                <div className="flex items-center gap-2 font-medium">
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
                        const balance =
                          (pricePreview?.roomsSubtotal ?? finalTotal) - paid;

                        return (
                          <FormItem className="space-y-3 animate-in slide-in-from-top-2 fade-in duration-300">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <FormLabel className="text-sm font-semibold text-foreground">
                                  Số tiền thực thu
                                </FormLabel>
                                <Button
                                  variant="ghost"
                                  type="button"
                                  size="sm"
                                  className="h-6 text-xs text-primary font-medium hover:bg-primary/10"
                                  onClick={() =>
                                    field.onChange(Math.round(finalTotal))
                                  }
                                >
                                  Thu đủ 100%
                                </Button>
                              </div>

                              <FormControl>
                                <div className="relative">
                                  <Input
                                    type="number"
                                    placeholder="0"
                                    className="h-11 pl-4 pr-12 font-mono text-lg font-bold"
                                    max={
                                      pricePreview?.roomsSubtotal ?? finalTotal
                                    }
                                    {...field}
                                    onChange={(e) =>
                                      field.onChange(
                                        e.target.value
                                          ? Number(e.target.value)
                                          : null
                                      )
                                    }
                                  />
                                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground text-sm font-medium">
                                    VND
                                  </div>
                                </div>
                              </FormControl>
                            </div>

                            {/* BALANCE INDICATOR */}
                            <div className="flex items-center justify-between p-3 bg-muted/40 rounded-lg border border-border/50">
                              <span className="text-xs text-muted-foreground font-medium">
                                Công nợ còn lại
                              </span>
                              <span
                                className={cn(
                                  "font-mono font-bold text-sm",
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

              <DialogFooter className="px-6 py-4 bg-muted/20 border-t flex items-center justify-end gap-2">
                <DialogClose asChild>
                  <Button
                    variant="outline"
                    type="button"
                    className="flex-1 sm:flex-none border-dashed hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                    onClick={handleAbortDeposit}
                  >
                    Hủy bỏ
                  </Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm">
                    <Check className="mr-2 h-4 w-4" />
                    Xác nhận
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <ServiceBreakfastManagerDialog // Assuming this component exists
        open={serviceDialogOpen}
        onOpenChange={setServiceDialogOpen}
        form={form}
      />
    </Card>
  );
}
