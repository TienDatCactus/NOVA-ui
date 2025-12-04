import { zodResolver } from "@hookform/resolvers/zod";
import { format, parseISO } from "date-fns";
import {
  ArrowUpCircle,
  Check,
  CreditCard,
  Gift,
  Loader2,
  TrendingUp,
} from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Badge } from "~/components/ui/badge";
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
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
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
import { cn, formatMoney } from "~/lib/utils";
import type {
  BookingDetailResponseDto,
  BookingUpgradeRoomRequestDto,
} from "~/services/api/booking/dto";
import { PaymentSchema } from "~/services/schema/payment.schema";
import { PAYMENT_METHODS } from "~/services/types/payment.types";
import {
  calculateRemainingNights,
  calculateUpgradeSurcharge,
  getUpgradeValidationMessage,
} from "../../container/upgrade-room-calculator";
import { BookingSchema } from "~/services/api/booking/booking.schema";
import { useUpgradeRoom } from "../../container/use-booking-checkout.hooks";
import { useAvailableRoomsForChange } from "~/routes/reservation/bookings/container/booking-query.hooks";

interface UpgradeRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingDetail: BookingDetailResponseDto;
}

export function UpgradeRoomDialog({
  open,
  onOpenChange,
  bookingDetail,
}: UpgradeRoomDialogProps) {
  const form = useForm<BookingUpgradeRoomRequestDto>({
    resolver: zodResolver(BookingSchema.BookingUpgradeRoomRequestSchema),
    defaultValues: {
      bookingRoomId: "",
      newRoomId: "",
      isFree: false,
      reason: "",
      paidAmount: 0,
      transactionReference: "",
    },
  });

  const { mutate: upgradeRoom, isPending: isUpgrading } = useUpgradeRoom(
    bookingDetail?.id || ""
  );
  const { data: availableRooms } = useAvailableRoomsForChange({
    bookingId: bookingDetail?.id || "",
    bookingRoomId: form.watch("bookingRoomId") || "",
  });
  const selectedBookingRoomId = form.watch("bookingRoomId");
  const selectedNewRoomId = form.watch("newRoomId");
  const isFree = form.watch("isFree");
  const paymentMethod = form.watch("paymentMethod");

  const selectedBookingRoom = bookingDetail.rooms.find(
    (r) => r.bookingRoomId === selectedBookingRoomId
  );

  const selectedNewRoom = availableRooms?.find(
    (r) => r.roomId === selectedNewRoomId
  );

  const remainingNights =
    selectedBookingRoom && selectedNewRoom
      ? calculateRemainingNights(
          bookingDetail.status,
          selectedBookingRoom.fromDate,
          selectedBookingRoom.toDate
        )
      : 0;

  const surcharge =
    selectedBookingRoom && selectedNewRoom && !isFree
      ? calculateUpgradeSurcharge(
          selectedBookingRoom.baseRate || 0,
          selectedNewRoom.baseRate || 0,
          remainingNights
        )
      : 0;

  // Validation message
  const validationMessage =
    selectedBookingRoom && selectedNewRoom
      ? getUpgradeValidationMessage(
          selectedBookingRoom.baseRate || 0,
          selectedNewRoom.baseRate || 0,
          remainingNights
        )
      : null;

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  const handleSubmit = form.handleSubmit(async (data) => {
    if (validationMessage) {
      toast.error(validationMessage);
      return;
    }

    const wantsToPayNow = !data.isFree && data.paymentMethod && data.paidAmount;
    if (wantsToPayNow && data.paidAmount && data.paidAmount > surcharge) {
      toast.error("Số tiền thanh toán không được vượt quá phí upgrade");
      return;
    }

    try {
      await upgradeRoom({
        bookingRoomId: data.bookingRoomId,
        newRoomId: data.newRoomId,
        isFree: data.isFree,
        reason: data.reason?.trim() || undefined,
        paymentMethod: wantsToPayNow ? data.paymentMethod : undefined,
        paidAmount: wantsToPayNow ? data.paidAmount : undefined,
        transactionReference:
          wantsToPayNow && data.transactionReference
            ? data.transactionReference
            : undefined,
      });

      onOpenChange(false);
    } catch (error) {
      // Error handled by parent
    }
  });

  const handleQuickAmount = (percentage: number) => {
    const amount = Math.round(surcharge * percentage);
    form.setValue("paidAmount", amount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <ArrowUpCircle className="h-5 w-5 text-primary" />
            Nâng cấp phòng (Room Upgrade)
          </DialogTitle>
          <DialogDescription className="text-sm">
            Nâng cấp lên hạng phòng cao hơn. Có thể miễn phí (complimentary)
            hoặc thu phí bổ sung.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 py-4">
          <Form {...form}>
            <div className="space-y-6">
              {/* STEP 1: SELECT CURRENT ROOM */}
              <FormField
                control={form.control}
                name="bookingRoomId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">
                      1. Chọn phòng hiện tại cần upgrade
                    </FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Chọn phòng hiện tại..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {bookingDetail.rooms.map((room) => (
                          <SelectItem
                            key={room.bookingRoomId}
                            value={room.bookingRoomId}
                          >
                            <div className="flex items-center gap-3">
                              <span className="font-medium">
                                {room.roomName}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {room.roomTypeName}
                              </span>
                              <span className="text-xs font-mono">
                                {formatMoney(room.baseRate || 0).vndFormatted}
                                /đêm
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* STEP 2: SELECT NEW ROOM */}
              {selectedBookingRoomId && (
                <FormField
                  control={form.control}
                  name="newRoomId"
                  render={({ field }) => (
                    <FormItem className="animate-in slide-in-from-top-2 fade-in">
                      <FormLabel className="text-sm font-semibold">
                        2. Chọn phòng mới (hạng cao hơn)
                      </FormLabel>
                      {availableRooms?.length === 0 ? (
                        <Card className="p-6 text-center bg-muted/30">
                          <p className="text-sm text-muted-foreground">
                            Không có phòng hạng cao hơn khả dụng trong khoảng
                            thời gian này.
                          </p>
                        </Card>
                      ) : (
                        <div className="grid grid-cols-2 gap-3">
                          {availableRooms?.map((room) => {
                            const isSelected = field.value === room.roomId;
                            const isHigher =
                              selectedBookingRoom &&
                              room.baseRate >
                                (selectedBookingRoom.baseRate || 0);

                            return (
                              <Card
                                key={room.roomId}
                                className={cn(
                                  "p-4 cursor-pointer transition-all hover:border-primary/50",
                                  isSelected && "border-primary bg-primary/5",
                                  !isHigher && "opacity-50 cursor-not-allowed"
                                )}
                                onClick={() =>
                                  isHigher && field.onChange(room.roomId)
                                }
                              >
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium text-foreground">
                                      {room.roomName}
                                    </span>
                                    {isHigher && (
                                      <TrendingUp className="h-4 w-4 text-emerald-600" />
                                    )}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {room.roomTypeName}
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-mono font-semibold text-primary">
                                      {
                                        formatMoney(room.baseRate || 0)
                                          .vndFormatted
                                      }
                                      /đêm
                                    </span>
                                    {selectedBookingRoom && isHigher && (
                                      <Badge
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        +
                                        {
                                          formatMoney(
                                            room.baseRate -
                                              (selectedBookingRoom.baseRate ||
                                                0)
                                          ).vndFormatted
                                        }
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </Card>
                            );
                          })}
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* STEP 3: UPGRADE TYPE */}
              {selectedNewRoomId && !validationMessage && (
                <div className="space-y-4 animate-in slide-in-from-top-2 fade-in">
                  <Separator />
                  <Label className="text-sm font-semibold">
                    3. Loại upgrade
                  </Label>

                  <FormField
                    control={form.control}
                    name="isFree"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <RadioGroup
                            value={field.value ? "free" : "paid"}
                            onValueChange={(val) =>
                              field.onChange(val === "free")
                            }
                          >
                            <Card className="p-4">
                              <div className="flex items-start gap-3">
                                <RadioGroupItem
                                  value="free"
                                  id="free"
                                  className="mt-1"
                                />
                                <Label
                                  htmlFor="free"
                                  className="flex-1 cursor-pointer space-y-1"
                                >
                                  <div className="flex items-center gap-2 font-medium">
                                    <Gift className="h-4 w-4 text-emerald-600" />
                                    Complimentary Upgrade (Miễn phí)
                                  </div>
                                  <p className="text-xs text-muted-foreground font-normal">
                                    Không tạo invoice. Thường dùng cho khách VIP
                                    hoặc service recovery.
                                  </p>
                                </Label>
                              </div>
                            </Card>

                            <Card className="p-4">
                              <div className="flex items-start gap-3">
                                <RadioGroupItem
                                  value="paid"
                                  id="paid"
                                  className="mt-1"
                                />
                                <Label
                                  htmlFor="paid"
                                  className="flex-1 cursor-pointer space-y-1"
                                >
                                  <div className="flex items-center gap-2 font-medium">
                                    <CreditCard className="h-4 w-4 text-primary" />
                                    Paid Upgrade (Thu phí)
                                  </div>
                                  <p className="text-xs text-muted-foreground font-normal">
                                    Tạo invoice surcharge. Có thể thanh toán
                                    ngay hoặc để checkout.
                                  </p>
                                  {!field.value && (
                                    <div className="mt-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                                      <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">
                                          Phí upgrade ({remainingNights} đêm):
                                        </span>
                                        <span className="font-mono font-bold text-primary">
                                          {formatMoney(surcharge).vndFormatted}
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </Label>
                              </div>
                            </Card>
                          </RadioGroup>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Free Upgrade: Reason Required */}
                  {isFree && (
                    <FormField
                      control={form.control}
                      name="reason"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">
                            Lý do upgrade miễn phí{" "}
                            <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="VD: Khách VIP, Service recovery, Oversold..."
                              {...field}
                              className="min-h-[80px] resize-none"
                              maxLength={500}
                            />
                          </FormControl>
                          <p className="text-xs text-muted-foreground">
                            {(field.value || "").length}/500 ký tự
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Paid Upgrade: Optional Payment Now */}
                  {!isFree && (
                    <div className="space-y-4">
                      <Separator />
                      <Label className="text-sm font-semibold">
                        4. Thanh toán ngay (tùy chọn)
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Để trống nếu muốn thanh toán khi checkout
                      </p>

                      <FormField
                        control={form.control}
                        name="paymentMethod"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">
                              Phương thức thanh toán
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
                                    {method.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {paymentMethod && (
                        <>
                          <FormField
                            control={form.control}
                            name="paidAmount"
                            render={({ field }) => (
                              <FormItem className="animate-in slide-in-from-top-2">
                                <div className="flex items-center justify-between">
                                  <FormLabel className="text-xs">
                                    Số tiền thanh toán
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
                                      max={surcharge}
                                    />
                                  </FormControl>
                                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium pointer-events-none">
                                    VND
                                  </span>
                                </div>
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
                                    value={field.value || ""}
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
                  )}
                </div>
              )}

              {/* VALIDATION ERROR */}
              {validationMessage && (
                <Card className="p-4 bg-destructive/10 border-destructive">
                  <p className="text-sm text-destructive">
                    {validationMessage}
                  </p>
                </Card>
              )}
            </div>
          </Form>
        </ScrollArea>

        <DialogFooter className="px-6 py-4 bg-muted/5 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={form.formState.isSubmitting}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              !selectedBookingRoomId ||
              !selectedNewRoomId ||
              !!validationMessage ||
              form.formState.isSubmitting
            }
            className="min-w-[120px]"
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Xác nhận upgrade
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
