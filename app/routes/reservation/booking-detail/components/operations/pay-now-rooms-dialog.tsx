import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Check, CreditCard, Loader2, Wallet } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
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
import { cn, formatMoney } from "~/lib/utils";
import { BookingSchema } from "~/services/api/booking/booking.schema";
import type {
  BookingDetailResponseDto,
  BookingPayForRoomRequestDto,
} from "~/services/api/booking/dto";
import { PAYMENT_METHODS } from "~/services/types/payment.types";
import { usePayNowRooms } from "../../container/use-booking-checkout.hooks";

interface PayNowRoomsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingDetail: BookingDetailResponseDto;
}

export function PayNowRoomsDialog({
  open,
  onOpenChange,
  bookingDetail,
}: PayNowRoomsDialogProps) {
  const { mutate: payNowRooms, isPending: isPaying } = usePayNowRooms(
    bookingDetail?.id || ""
  );

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

  const availableRooms = bookingDetail.rooms.filter((room) => {
    const roomCheckinDate = new Date(room.fromDate);
    const roomCheckoutDate = new Date(room.toDate);
    const now = new Date();
    return roomCheckinDate <= now && now < roomCheckoutDate;
  });

  const selectedTotal = selectedRoomIds.length * 100000; // TODO: Calculate from actual room charges

  const toggleRoomSelection = (bookingRoomId: string) => {
    const current = form.getValues("bookingRoomIds");
    const newValue = current.includes(bookingRoomId)
      ? current.filter((id) => id !== bookingRoomId)
      : [...current, bookingRoomId];
    form.setValue("bookingRoomIds", newValue);
  };

  const toggleSelectAll = () => {
    if (selectedRoomIds.length === availableRooms.length) {
      form.setValue("bookingRoomIds", []);
    } else {
      form.setValue(
        "bookingRoomIds",
        availableRooms.map((room) => room.bookingRoomId)
      );
    }
  };

  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  const handleSubmit = form.handleSubmit(async (data) => {
    if (data.paidAmount > selectedTotal) {
      toast.error("Số tiền thanh toán không được vượt quá tổng tiền phòng");
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
          onOpenChange(false);
        },
      }
    );
  });

  const handleQuickAmount = (percentage: number) => {
    const amount = Math.round(selectedTotal * percentage);
    form.setValue("paidAmount", amount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            Thanh toán phòng ngay (InHouse Payment)
          </DialogTitle>
          <DialogDescription className="text-sm">
            Chọn phòng cần thanh toán ngay trong lúc khách đang ở. Hệ thống sẽ
            tạo invoice riêng cho các phòng này.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 py-4">
          <Form {...form}>
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">
                    Chọn phòng cần thanh toán
                  </Label>
                  {availableRooms.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleSelectAll}
                      className="h-7 text-xs"
                    >
                      {selectedRoomIds.length === availableRooms.length
                        ? "Bỏ chọn tất cả"
                        : "Chọn tất cả"}
                    </Button>
                  )}
                </div>

                {availableRooms.length === 0 ? (
                  <Card className="p-6 text-center bg-muted/30">
                    <p className="text-sm text-muted-foreground">
                      Không có phòng nào khả dụng để thanh toán ngay.
                      <br />
                      Chức năng này chỉ áp dụng khi khách đang ở (CheckedIn).
                    </p>
                  </Card>
                ) : (
                  <div className="space-y-2">
                    {availableRooms.map((room) => {
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
                                  {formatMoney(100000).vndFormatted}
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
                                    new Date(room.fromDate),
                                    "dd/MM/yyyy"
                                  )}{" "}
                                  →{" "}
                                  {format(new Date(room.toDate), "dd/MM/yyyy")}
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

              <Separator />

              {/* TOTAL DISPLAY */}
              {selectedRoomIds.length > 0 && (
                <div className="flex items-center justify-between p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                  <span className="text-sm font-medium text-emerald-700">
                    Tổng tiền {selectedRoomIds.length} phòng đã chọn:
                  </span>
                  <span className="text-xl font-bold text-emerald-600 font-mono">
                    {formatMoney(selectedTotal).vndFormatted}
                  </span>
                </div>
              )}

              {/* PAYMENT SECTION */}
              {selectedRoomIds.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <Label className="text-sm font-semibold">
                      Thông tin thanh toán
                    </Label>

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
                                max={selectedTotal}
                              />
                            </FormControl>
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium pointer-events-none">
                              VND
                            </span>
                          </div>
                          {field.value && field.value < selectedTotal && (
                            <p className="text-xs text-orange-600">
                              Còn thiếu:{" "}
                              {
                                formatMoney(selectedTotal - field.value)
                                  .vndFormatted
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
                          <FormLabel className="text-xs">
                            Mã giao dịch (tùy chọn)
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="VD: TXN123456"
                              className="h-10"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </>
              )}
            </div>
          </Form>
        </ScrollArea>

        <DialogFooter className="px-6 py-4 bg-muted/5 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={form.formState.isSubmitting || isPaying}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              selectedRoomIds.length === 0 ||
              !paymentMethod ||
              !paidAmount ||
              paidAmount <= 0 ||
              form.formState.isSubmitting ||
              isPaying
            }
            className="min-w-[120px]"
          >
            {form.formState.isSubmitting || isPaying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Xác nhận thanh toán
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
