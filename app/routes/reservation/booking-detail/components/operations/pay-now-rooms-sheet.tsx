import { zodResolver } from "@hookform/resolvers/zod";
import {
  BedDouble,
  Check,
  CheckCircle2,
  CircleDollarSign,
  CreditCard,
  Info,
  Loader2,
  Receipt,
  Utensils,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { ScrollArea } from "~/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import { cn, formatMoney } from "~/lib/utils";
import { BookingSchema } from "~/services/api/booking/booking.schema";
import type {
  BookingDetailResponseDto,
  BookingPayForRoomRequestDto,
} from "~/services/api/booking/dto";
import { PAYMENT_METHODS } from "~/services/types/payment.types";
import {
  usePayNowRooms,
  useUnpaidRooms,
} from "../../container/use-booking-checkout.hooks";

interface PayNowRoomsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingDetail: BookingDetailResponseDto;
}

export function PayNowRoomsSheet({
  open,
  onOpenChange,
  bookingDetail,
}: PayNowRoomsSheetProps) {
  const { mutate: payNowRooms, isPending: isPaying } = usePayNowRooms(
    bookingDetail?.id || "",
  );
  const { data: unpaidRoomsData } = useUnpaidRooms(bookingDetail?.id || "", {
    enabled: open,
  });

  const form = useForm<BookingPayForRoomRequestDto>({
    resolver: zodResolver(BookingSchema.BookingPayForRoomRequestSchema),
    defaultValues: {
      bookingRoomIds: [],
      paymentMethod: undefined,
      paidAmount: 0,
      transactionReference: "",
    },
  });

  const selectedRoomIds = form.watch("bookingRoomIds");
  const paymentMethod = form.watch("paymentMethod");
  const paidAmount = form.watch("paidAmount");

  const unpaidRatio = useMemo(() => {
    if (
      !unpaidRoomsData?.unpaidRooms ||
      unpaidRoomsData.unpaidRooms.length === 0
    )
      return 1;
    const totalChargeAllRooms = unpaidRoomsData.unpaidRooms.reduce(
      (sum, room) => sum + room.totalCharge,
      0,
    );
    if (totalChargeAllRooms === 0) return 1;
    return (unpaidRoomsData.totalUnpaidAmount || 0) / totalChargeAllRooms;
  }, [unpaidRoomsData]);

  const selectedRoomsSubtotal = useMemo(() => {
    if (!unpaidRoomsData?.unpaidRooms || selectedRoomIds.length === 0) return 0;
    const selectedRoomsTotalCharge = unpaidRoomsData.unpaidRooms
      .filter((room) => selectedRoomIds.includes(room.bookingRoomId))
      .reduce((sum, room) => sum + room.totalCharge, 0);
    return Math.round(selectedRoomsTotalCharge * unpaidRatio);
  }, [unpaidRoomsData?.unpaidRooms, selectedRoomIds, unpaidRatio]);

  const paymentValidation = useMemo(() => {
    if (!paidAmount || paidAmount <= 0)
      return { isValid: false, error: "Số tiền phải lớn hơn 0" };
    if (paidAmount > (selectedRoomsSubtotal ?? 0))
      return { isValid: false, error: "Số tiền vượt quá tổng phòng đã chọn" };
    return { isValid: true, error: null };
  }, [paidAmount, selectedRoomsSubtotal]);

  // --- Handlers ---
  const toggleRoomSelection = (bookingRoomId: string) => {
    const current = form.getValues("bookingRoomIds");
    const newValue = current.includes(bookingRoomId)
      ? current.filter((id) => id !== bookingRoomId)
      : [...current, bookingRoomId];
    form.setValue("bookingRoomIds", newValue);
  };

  const toggleSelectAll = () => {
    if (selectedRoomIds.length === unpaidRoomsData?.unpaidRooms.length) {
      form.setValue("bookingRoomIds", []);
    } else {
      form.setValue(
        "bookingRoomIds",
        unpaidRoomsData?.unpaidRooms.map((room) => room.bookingRoomId) || [],
      );
    }
  };

  const handleQuickAmount = (percentage: number) => {
    const amount = Math.round((selectedRoomsSubtotal ?? 0) * percentage);
    form.setValue("paidAmount", amount);
  };

  useEffect(() => {
    if (!open) form.reset();
  }, [open, form]);

  const handleSubmit = form.handleSubmit((data) => {
    if (!paymentValidation.isValid) {
      toast.error(
        paymentValidation.error || "Thông tin thanh toán không hợp lệ",
      );
      return;
    }
    payNowRooms(
      { ...data, transactionReference: data.transactionReference || undefined },
      {
        onSuccess: () => {
          toast.success("Thanh toán phòng thành công");
          onOpenChange(false);
        },
      },
    );
  });

  const canSubmit = useMemo(
    () =>
      selectedRoomIds.length > 0 &&
      paymentMethod &&
      paymentValidation.isValid &&
      !isPaying,
    [
      selectedRoomIds.length,
      paymentMethod,
      paymentValidation.isValid,
      isPaying,
    ],
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[100vw] lg:max-w-5xl gap-0 p-0 flex flex-col bg-stone-50"
      >
        {/* HEADER */}
        <SheetHeader className="px-6 py-4 border-b bg-white shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700">
              <Wallet className="h-6 w-6" />
            </div>
            <div className="space-y-0.5">
              <SheetTitle className="text-xl">
                Thanh toán phòng (In-house)
              </SheetTitle>
              <SheetDescription>
                Tạo phiếu thu riêng cho từng phòng khi khách đang lưu trú.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          {/* LEFT: ROOM SELECTION */}
          <ScrollArea className="flex-1 border-r bg-stone-50/50">
            <div className="p-6 space-y-6">
              {/* Toolbar */}
              <div className="flex items-center justify-between sticky top-0 bg-stone-50 z-10 pb-2 border-b border-stone-200/60 mb-4">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <BedDouble className="h-4 w-4 text-muted-foreground" />
                  Danh sách phòng chưa thanh toán
                </Label>
                {unpaidRoomsData?.unpaidRooms &&
                  unpaidRoomsData?.unpaidRooms.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleSelectAll}
                      className="h-8 text-xs font-medium text-primary hover:bg-primary/10"
                    >
                      {selectedRoomIds.length ===
                      unpaidRoomsData?.unpaidRooms.length
                        ? "Bỏ chọn tất cả"
                        : "Chọn tất cả"}
                    </Button>
                  )}
              </div>

              {/* Room Grid */}
              {!unpaidRoomsData?.unpaidRooms?.length ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                  <div className="p-4 bg-white rounded-full mb-3 shadow-sm">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                  </div>
                  <p>Tất cả các phòng đã được thanh toán!</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {unpaidRoomsData?.unpaidRooms.map((room) => {
                    const isSelected = selectedRoomIds.includes(
                      room.bookingRoomId,
                    );
                    return (
                      <div
                        key={room.bookingRoomId}
                        onClick={() => toggleRoomSelection(room.bookingRoomId)}
                        className={cn(
                          "relative group flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer bg-white hover:shadow-md",
                          isSelected
                            ? "border-emerald-500 ring-1 ring-emerald-500 shadow-sm"
                            : "border-stone-200 hover:border-emerald-300",
                        )}
                      >
                        <Checkbox
                          checked={isSelected}
                          className={cn(
                            "mt-1 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600",
                          )}
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-bold text-foreground text-base">
                                {room.roomName}
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                {room.roomTypeName}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-mono font-bold text-emerald-700">
                                {
                                  formatMoney(
                                    room.roomCharge + room.breakfastCharge,
                                  ).vndFormatted
                                }
                              </p>
                              {room.nights > 0 && (
                                <span className="text-[10px] bg-stone-100 px-1.5 py-0.5 rounded text-muted-foreground">
                                  {room.nights} đêm
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground pt-2 border-t border-dashed">
                            <div className="flex items-center gap-1.5">
                              <BedDouble className="h-3.5 w-3.5" />
                              Phòng:{" "}
                              <span className="font-medium text-foreground">
                                {formatMoney(room.roomCharge).vndFormatted}
                              </span>
                            </div>
                            {room.breakfastCharge > 0 && (
                              <>
                                <Separator
                                  orientation="vertical"
                                  className="h-3"
                                />
                                <div className="flex items-center gap-1.5">
                                  <Utensils className="h-3.5 w-3.5" />
                                  Ăn sáng:{" "}
                                  <span className="font-medium text-foreground">
                                    {
                                      formatMoney(room.breakfastCharge)
                                        .vndFormatted
                                    }
                                  </span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Calculation Breakdown */}
              {selectedRoomIds.length > 0 && (
                <div className="mt-8 bg-white rounded-xl border border-stone-200 overflow-hidden">
                  <div className="bg-stone-50/50 px-4 py-3 border-b border-stone-200">
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                      <Receipt className="h-4 w-4 text-muted-foreground" />
                      Chi tiết thanh toán
                    </h3>
                  </div>

                  <div className="p-4 space-y-3">
                    <SummaryRow
                      label={`Tiền phòng (${selectedRoomIds.length} phòng)`}
                      value={selectedRoomsSubtotal}
                    />
                    {unpaidRatio < 1 && (
                      <div className="flex justify-end text-xs text-orange-600 italic -mt-2 mb-2">
                        *Đã trừ {Math.round((1 - unpaidRatio) * 100)}% tiền cọc
                      </div>
                    )}

                    <Separator className="my-2" />

                    <div className="flex justify-between items-center pt-1">
                      <span className="font-bold text-base">Tổng cộng</span>
                      <span className="font-mono font-bold text-xl text-emerald-700">
                        {formatMoney(selectedRoomsSubtotal ?? 0).vndFormatted}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* RIGHT: PAYMENT FORM */}
          <div className="w-full lg:w-[400px] bg-white border-l shadow-[-4px_0_24px_rgba(0,0,0,0.02)] flex flex-col h-full z-20">
            <Form {...form}>
              <div className="p-6 flex-1 overflow-y-auto space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2 text-stone-800">
                    <CreditCard className="h-5 w-5 text-emerald-600" />
                    Thông tin thanh toán
                  </h3>

                  {selectedRoomIds.length === 0 ? (
                    <div className="rounded-lg bg-stone-50 border border-dashed border-stone-300 p-6 text-center text-sm text-muted-foreground">
                      Vui lòng chọn phòng bên trái để tiếp tục.
                    </div>
                  ) : (
                    <>
                      <FormField
                        control={form.control}
                        name="paymentMethod"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Phương thức{" "}
                              <span className="text-red-500">*</span>
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="bg-stone-50 border-stone-200">
                                  <SelectValue placeholder="Chọn phương thức" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {PAYMENT_METHODS.map((method) => (
                                  <SelectItem
                                    key={method.value}
                                    value={method.value}
                                  >
                                    <div className="flex items-center gap-2">
                                      <div className="p-1 bg-stone-100 rounded">
                                        <CreditCard className="h-3 w-3" />
                                      </div>
                                      {method.label}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="paidAmount"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel className="flex justify-between items-center">
                              <span>
                                Số tiền trả{" "}
                                <span className="text-red-500">*</span>
                              </span>
                              <Badge
                                variant="outline"
                                onClick={() => handleQuickAmount(1)}
                              >
                                100%
                              </Badge>
                            </FormLabel>
                            <div className="relative">
                              <FormControl>
                                <div className="relative">
                                  <CircleDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    type="number"
                                    {...field}
                                    className="pl-9 font-mono text-lg font-semibold bg-stone-50 border-stone-200 focus-visible:ring-emerald-500"
                                    max={selectedRoomsSubtotal}
                                  />
                                </div>
                              </FormControl>
                            </div>
                            {field.value < (selectedRoomsSubtotal ?? 0) && (
                              <p className="text-xs text-orange-600 font-medium flex items-center gap-1">
                                <Info className="h-3 w-3" />
                                Còn thiếu:{" "}
                                {
                                  formatMoney(
                                    (selectedRoomsSubtotal ?? 0) - field.value,
                                  ).vndFormatted
                                }
                              </p>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="transactionReference"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mã giao dịch (Ref No)</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="VD: 492042"
                                className="bg-stone-50 border-stone-200"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                </div>
              </div>

              {/* PAYMENT BUTTON AREA */}
              <div className="p-6 border-t bg-stone-50">
                <Button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className={cn(
                    "w-full h-12 text-base shadow-lg transition-all",
                    canSubmit
                      ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200"
                      : "",
                  )}
                >
                  {isPaying ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Đang xử
                      lý...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-5 w-5" /> Xác nhận thanh toán
                    </>
                  )}
                </Button>
              </div>
            </Form>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Helper
function SummaryRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono font-medium text-foreground">
        {formatMoney(value).vndFormatted}
      </span>
    </div>
  );
}
