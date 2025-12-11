import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import {
  ArrowRight,
  Check,
  CreditCard,
  Info,
  Loader2,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
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
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import { Switch } from "~/components/ui/switch";
import { cn, formatMoney } from "~/lib/utils";
import { BookingSchema } from "~/services/api/booking/booking.schema";
import type {
  BookingDetailResponseDto,
  BookingPayForRoomRequestDto,
} from "~/services/api/booking/dto";
import { PAYMENT_METHODS } from "~/services/types/payment.types";
import {
  useCalculateInvoiceFees,
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
  const [applyVat, setApplyVat] = useState(false);
  const [applyServiceCharge, setApplyServiceCharge] = useState(false);

  const { mutate: payNowRooms, isPending: isPaying } = usePayNowRooms(
    bookingDetail?.id || ""
  );
  const { data: unpaidRoomsData } = useUnpaidRooms(bookingDetail?.id || "");

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

  // Calculate fees (VAT + Service Charge)
  const { data: calculatedFees, refetch: refetchFees } =
    useCalculateInvoiceFees(
      {
        subtotalAmount: unpaidRoomsData?.totalUnpaidAmount || 0,
        applyVat,
        applyServiceCharge,
      },
      open && (unpaidRoomsData?.totalUnpaidAmount ?? 0) > 0
    );

  // Recalculate when toggles change
  useEffect(() => {
    if ((unpaidRoomsData?.totalUnpaidAmount ?? 0) > 0 && open) {
      refetchFees();
    }
  }, [
    applyVat,
    applyServiceCharge,
    unpaidRoomsData?.totalUnpaidAmount || 0,
    open,
    refetchFees,
  ]);
  const totalWithFees = useMemo(() => {
    return calculatedFees?.totalAmount || unpaidRoomsData?.totalUnpaidAmount;
  }, [calculatedFees, unpaidRoomsData?.totalUnpaidAmount]);

  const paymentValidation = useMemo(() => {
    if (!paidAmount || paidAmount <= 0) {
      return { isValid: false, error: "Số tiền phải lớn hơn 0" };
    }
    if (paidAmount > (totalWithFees ?? 0)) {
      return { isValid: false, error: "Số tiền vượt quá tổng phòng đã chọn" };
    }
    return { isValid: true, error: null };
  }, [paidAmount, totalWithFees]);

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
        unpaidRoomsData?.unpaidRooms.map((room) => room.bookingRoomId) || []
      );
    }
  };

  const handleQuickAmount = (percentage: number) => {
    const amount = Math.round((totalWithFees ?? 0) * percentage);
    form.setValue("paidAmount", amount);
  };

  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  const handleSubmit = form.handleSubmit(async (data) => {
    if (!paymentValidation.isValid) {
      toast.error(
        paymentValidation.error || "Thông tin thanh toán không hợp lệ"
      );
      return;
    }

    payNowRooms(
      {
        bookingRoomIds: data.bookingRoomIds,
        paymentMethod: data.paymentMethod,
        paidAmount: data.paidAmount,
        transactionReference: data.transactionReference || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Thanh toán phòng thành công");
          onOpenChange(false);
        },
      }
    );
  });

  const canSubmit = useMemo(() => {
    return (
      selectedRoomIds.length > 0 &&
      paymentMethod &&
      paymentValidation.isValid &&
      !isPaying
    );
  }, [
    selectedRoomIds.length,
    paymentMethod,
    paymentValidation.isValid,
    isPaying,
  ]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[100vw] lg:max-w-5xl gap-0 p-0 flex flex-col bg-background"
      >
        {/* HEADER */}
        <SheetHeader className="px-6 py-4 border-b bg-background shrink-0">
          <div className="space-y-1">
            <SheetTitle className="text-xl flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              Thanh toán phòng ngay (InHouse Payment)
            </SheetTitle>
            <SheetDescription>
              Chọn phòng cần thanh toán ngay trong lúc khách đang ở. Hệ thống sẽ
              tạo invoice riêng cho các phòng này.
            </SheetDescription>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          {/* LEFT COLUMN: ROOM SELECTION & PREVIEW */}
          <ScrollArea className="flex-1 border-r bg-background">
            <div className="p-6 space-y-6">
              <Form {...form}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold">
                      Chọn phòng cần thanh toán
                    </Label>
                    {unpaidRoomsData?.unpaidRooms &&
                      unpaidRoomsData?.unpaidRooms.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={toggleSelectAll}
                          className="h-7 text-xs"
                        >
                          {selectedRoomIds.length ===
                          unpaidRoomsData?.unpaidRooms.length
                            ? "Bỏ chọn tất cả"
                            : "Chọn tất cả"}
                        </Button>
                      )}
                  </div>

                  {unpaidRoomsData?.unpaidRooms.length === 0 ? (
                    <Card className="p-6 text-center bg-muted/30">
                      <p className="text-sm text-muted-foreground">
                        Không có phòng nào khả dụng để thanh toán ngay.
                        <br />
                        Chức năng này chỉ áp dụng khi khách đang ở (CheckedIn).
                      </p>
                    </Card>
                  ) : (
                    <div className="space-y-2">
                      {unpaidRoomsData?.unpaidRooms.map((room) => {
                        const isSelected = selectedRoomIds.includes(
                          room.bookingRoomId
                        );
                        return (
                          <Card
                            key={room.bookingRoomId}
                            className={cn(
                              "p-4 cursor-pointer transition-all hover:border-primary/50",
                              isSelected && "border-primary bg-primary/5"
                            )}
                            onClick={() =>
                              toggleRoomSelection(room.bookingRoomId)
                            }
                          >
                            <div className="flex items-start gap-3">
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() =>
                                  toggleRoomSelection(room.bookingRoomId)
                                }
                                className="mt-1"
                              />
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-foreground">
                                    {room.roomName}
                                  </span>
                                  <span className="font-mono font-semibold text-primary">
                                    {formatMoney(room.roomCharge).vndFormatted}
                                  </span>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <span>{room.roomTypeName}</span>
                                  <Separator
                                    orientation="vertical"
                                    className="h-3"
                                  />
                                  <span>
                                    {format(
                                      new Date(room.checkinDate),
                                      "dd/MM/yyyy"
                                    )}{" "}
                                    →{" "}
                                    {format(
                                      new Date(room.checkoutDate),
                                      "dd/MM/yyyy"
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Summary Section */}
                {selectedRoomIds.length > 0 && (
                  <>
                    <Separator className="my-6" />
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold">
                        Tổng kết thanh toán
                      </h3>
                      <div className="border rounded-lg overflow-hidden bg-background">
                        <div className="divide-y text-sm">
                          <div className="flex justify-between p-4">
                            <span className="text-muted-foreground">
                              Số phòng đã chọn
                            </span>
                            <span className="font-medium">
                              {selectedRoomIds.length} phòng
                            </span>
                          </div>
                          <div className="flex justify-between p-4">
                            <span className="text-muted-foreground">
                              Subtotal
                            </span>
                            <span className="font-mono">
                              {
                                formatMoney(
                                  unpaidRoomsData?.totalUnpaidAmount ?? 0
                                ).vndFormatted
                              }
                            </span>
                          </div>

                          {/* VAT Toggle */}
                          <div className="flex justify-between items-center p-4">
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={applyVat}
                                onCheckedChange={setApplyVat}
                                className="data-[state=checked]:bg-blue-600"
                              />
                              <span className="text-sm text-muted-foreground">
                                VAT
                              </span>
                            </div>
                            <span className="font-mono text-sm">
                              {applyVat && calculatedFees
                                ? formatMoney(calculatedFees.vatAmount || 0)
                                    .vndFormatted
                                : "0 ₫"}
                            </span>
                          </div>

                          {/* Service Charge Toggle */}
                          <div className="flex justify-between items-center p-4">
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={applyServiceCharge}
                                onCheckedChange={setApplyServiceCharge}
                                className="data-[state=checked]:bg-blue-600"
                              />
                              <span className="text-sm text-muted-foreground">
                                Phí dịch vụ
                              </span>
                            </div>
                            <span className="font-mono text-sm">
                              {applyServiceCharge && calculatedFees
                                ? formatMoney(
                                    calculatedFees.serviceChargeAmount || 0
                                  ).vndFormatted
                                : "0 ₫"}
                            </span>
                          </div>

                          <div className="flex justify-between items-center p-4 bg-emerald-50/50 dark:bg-emerald-900/20">
                            <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                              Tổng tiền
                            </span>
                            <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                              {formatMoney(totalWithFees ?? 0).vndFormatted}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </Form>
            </div>
          </ScrollArea>

          {/* RIGHT COLUMN: PAYMENT FORM */}
          <div className="w-full lg:w-[420px] bg-background border-l flex flex-col h-full">
            <div className="p-6 flex-1 overflow-y-auto">
              <Form {...form}>
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CreditCard className="w-4 h-4" />
                    <span className="font-semibold uppercase tracking-wide">
                      Thông tin thanh toán
                    </span>
                  </div>

                  {selectedRoomIds.length === 0 ? (
                    <Card className="p-6 text-center bg-muted/10">
                      <Info className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Vui lòng chọn ít nhất một phòng để tiếp tục thanh toán
                      </p>
                    </Card>
                  ) : (
                    <>
                      {/* Payment Method */}
                      <FormField
                        control={form.control}
                        name="paymentMethod"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">
                              Phương thức thanh toán{" "}
                              <span className="text-destructive">*</span>
                            </FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger className="h-10">
                                  <SelectValue placeholder="Chọn phương thức..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {PAYMENT_METHODS.map((method) => (
                                  <SelectItem
                                    key={method.value}
                                    value={method.value}
                                  >
                                    <div className="flex items-center gap-2">
                                      <CreditCard className="h-3.5 w-3.5" />
                                      <span>{method.label}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Paid Amount */}
                      <FormField
                        control={form.control}
                        name="paidAmount"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center justify-between">
                              <FormLabel className="text-xs">
                                Số tiền thanh toán{" "}
                                <span className="text-destructive">*</span>
                              </FormLabel>
                              <div className="flex gap-1.5">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleQuickAmount(0.5)}
                                  className="h-6 px-2 text-xs"
                                >
                                  50%
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleQuickAmount(1)}
                                  className="h-6 px-2 text-xs"
                                >
                                  100%
                                </Button>
                              </div>
                            </div>
                            <div className="relative">
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="0"
                                  {...field}
                                  className="pl-3 pr-12 h-10 font-mono"
                                  max={totalWithFees}
                                />
                              </FormControl>
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium pointer-events-none">
                                VND
                              </span>
                            </div>
                            {field.value &&
                              field.value < (totalWithFees ?? 0) && (
                                <p className="text-xs text-orange-600">
                                  Còn thiếu:{" "}
                                  {
                                    formatMoney(
                                      (totalWithFees ?? 0) - field.value
                                    ).vndFormatted
                                  }
                                </p>
                              )}
                            {!paymentValidation.isValid &&
                              paymentValidation.error && (
                                <p className="text-xs text-destructive">
                                  {paymentValidation.error}
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
                            <FormLabel className="text-xs">
                              Mã giao dịch (tùy chọn)
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="text"
                                placeholder="VD: TXN123456"
                                {...field}
                                className="h-10"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                </div>
              </Form>
            </div>

            {/* Footer Actions */}
            <div className="p-4 bg-background border-t shrink-0">
              <Button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="w-full h-11"
                variant={canSubmit ? "default" : "secondary"}
              >
                {isPaying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Xác nhận thanh toán
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* SHEET FOOTER */}
        <SheetFooter className="p-4 border-t bg-background shrink-0 flex-row items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Info className="w-4 h-4" />
            <span>
              Invoice sẽ được tạo tự động sau khi thanh toán thành công
            </span>
          </div>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPaying}
          >
            Đóng
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
