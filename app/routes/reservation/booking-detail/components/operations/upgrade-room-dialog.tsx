import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  ArrowUpCircle,
  Check,
  CreditCard,
  Gift,
  Loader2,
  TrendingUp,
} from "lucide-react";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton"; // Cần component này
import { Textarea } from "~/components/ui/textarea";
import { cn, formatMoney } from "~/lib/utils";
import { useAvailableRoomsForChange } from "~/routes/reservation/bookings/container/booking-query.hooks";
import { BookingSchema } from "~/services/api/booking/booking.schema";
import type {
  BookingDetailResponseDto,
  BookingUpgradeRoomRequestDto,
} from "~/services/api/booking/dto";
import { PAYMENT_METHODS } from "~/services/types/payment.types";
import {
  calculateRemainingNights,
  calculateUpgradeSurcharge,
  getUpgradeValidationMessage,
} from "../../container/upgrade-room-calculator";
import { useUpgradeRoom } from "../../container/use-booking-checkout.hooks";

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
    mode: "onChange", // Validate realtime
  });

  const selectedBookingRoomId = form.watch("bookingRoomId");
  const selectedNewRoomId = form.watch("newRoomId");
  const isFree = form.watch("isFree");
  const paymentMethod = form.watch("paymentMethod");

  const { mutate: upgradeRoom, isPending: isUpgrading } = useUpgradeRoom(
    bookingDetail?.id || ""
  );

  // Thêm isLoading từ hook để xử lý UI
  const { data: availableRooms, isLoading: isLoadingRooms } =
    useAvailableRoomsForChange({
      bookingId: bookingDetail?.id || "",
      bookingRoomId: selectedBookingRoomId || "",
      enabled: open && !!selectedBookingRoomId,
    });

  const selectedBookingRoom = useMemo(
    () =>
      bookingDetail.rooms.find(
        (r) => r.bookingRoomId === selectedBookingRoomId
      ),
    [bookingDetail.rooms, selectedBookingRoomId]
  );

  const selectedNewRoom = useMemo(
    () => availableRooms?.find((r) => r.roomId === selectedNewRoomId),
    [availableRooms, selectedNewRoomId]
  );

  const remainingNights = useMemo(() => {
    return selectedBookingRoom && selectedNewRoom
      ? calculateRemainingNights(
          bookingDetail.status,
          selectedBookingRoom.fromDate,
          selectedBookingRoom.toDate
        )
      : 0;
  }, [selectedBookingRoom, selectedNewRoom, bookingDetail.status]);

  const surcharge = useMemo(() => {
    return selectedBookingRoom && selectedNewRoom && !isFree
      ? calculateUpgradeSurcharge(
          selectedBookingRoom.baseRate || 0,
          selectedNewRoom.baseRate || 0,
          remainingNights
        )
      : 0;
  }, [selectedBookingRoom, selectedNewRoom, isFree, remainingNights]);

  const validationMessage = useMemo(() => {
    return selectedBookingRoom && selectedNewRoom
      ? getUpgradeValidationMessage(
          selectedBookingRoom.baseRate || 0,
          selectedNewRoom.baseRate || 0,
          remainingNights
        )
      : null;
  }, [selectedBookingRoom, selectedNewRoom, remainingNights]);

  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  const handleSubmit = form.handleSubmit((data) => {
    if (validationMessage) {
      toast.error(validationMessage);
      return;
    }

    const wantsToPayNow = !data.isFree && data.paymentMethod;

    // UX Improvement: Set Error vào field thay vì Toast
    if (wantsToPayNow && data.paidAmount && data.paidAmount > surcharge) {
      form.setError("paidAmount", {
        type: "manual",
        message: "Số tiền không được lớn hơn phí upgrade",
      });
      // Scroll tới lỗi (optional nếu form quá dài)
      return;
    }

    upgradeRoom(
      {
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
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          toast.success("Nâng cấp phòng thành công!");
        },
      }
    );
  });

  const handleQuickAmount = (percentage: number) => {
    const amount = Math.round(surcharge * percentage);
    form.setValue("paidAmount", amount, { shouldValidate: true });
    if (amount <= surcharge) {
      form.clearErrors("paidAmount");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b bg-muted/10">
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <ArrowUpCircle className="h-5 w-5 text-primary" />
            Nâng cấp phòng (Room Upgrade)
          </DialogTitle>
          <DialogDescription className="text-sm">
            Nâng cấp lên hạng phòng cao hơn.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 px-6 py-4">
          <Form {...form}>
            <div className="space-y-8 pb-4">
              {/* STEP 1: SELECT CURRENT ROOM */}
              <FormField
                control={form.control}
                name="bookingRoomId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="h-6 w-6 rounded-full p-0 flex items-center justify-center border-primary text-primary"
                      >
                        1
                      </Badge>
                      Chọn phòng hiện tại
                    </FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(val) => {
                        field.onChange(val);
                        form.setValue("newRoomId", ""); // Reset new room selection
                      }}
                    >
                      <FormControl>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Chọn phòng cần upgrade..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {bookingDetail.rooms.map((room) => (
                          <SelectItem
                            key={room.bookingRoomId}
                            value={room.bookingRoomId}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-left">
                              <span className="font-medium">
                                {room.roomName}
                              </span>
                              <span className="text-xs text-muted-foreground hidden sm:inline">
                                •
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {room.roomTypeName}
                              </span>
                              <Badge
                                variant="secondary"
                                className="ml-auto sm:ml-2 font-mono text-xs"
                              >
                                {formatMoney(room.baseRate || 0).vndFormatted}
                              </Badge>
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
                    <FormItem className="animate-in slide-in-from-top-2 fade-in duration-300">
                      <FormLabel className="text-sm font-semibold flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="h-6 w-6 rounded-full p-0 flex items-center justify-center border-primary text-primary"
                        >
                          2
                        </Badge>
                        Chọn hạng phòng mới
                      </FormLabel>

                      {isLoadingRooms ? (
                        // Skeleton Loading State
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <Skeleton className="h-24 w-full rounded-xl" />
                          <Skeleton className="h-24 w-full rounded-xl" />
                          <Skeleton className="h-24 w-full rounded-xl" />
                          <Skeleton className="h-24 w-full rounded-xl" />
                        </div>
                      ) : availableRooms?.length === 0 ? (
                        <Card className="p-8 text-center bg-muted/30 border-dashed">
                          <p className="text-sm text-muted-foreground">
                            Không tìm thấy phòng hạng cao hơn khả dụng cho{" "}
                            {remainingNights} đêm còn lại.
                          </p>
                        </Card>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                                  "p-4 cursor-pointer transition-all border-2 relative overflow-hidden",
                                  isSelected
                                    ? "border-primary bg-primary/5 shadow-md"
                                    : "border-transparent bg-muted/20 hover:border-primary/30",
                                  !isHigher &&
                                    "opacity-50 cursor-not-allowed grayscale"
                                )}
                                onClick={() =>
                                  isHigher && field.onChange(room.roomId)
                                }
                              >
                                {isSelected && (
                                  <div className="absolute top-0 right-0 p-1 bg-primary text-primary-foreground rounded-bl-lg">
                                    <Check className="h-3 w-3" />
                                  </div>
                                )}
                                <div className="space-y-3">
                                  <div className="flex items-start justify-between">
                                    <div className="font-medium text-foreground text-sm">
                                      {room.roomName}
                                      <div className="text-xs text-muted-foreground font-normal mt-0.5">
                                        {room.roomTypeName}
                                      </div>
                                    </div>
                                    {isHigher && (
                                      <TrendingUp className="h-4 w-4 text-emerald-600 shrink-0" />
                                    )}
                                  </div>

                                  <div className="flex items-center justify-between pt-2 border-t border-dashed border-gray-300">
                                    <span className="text-xs font-mono font-medium text-muted-foreground">
                                      {
                                        formatMoney(room.baseRate || 0)
                                          .vndFormatted
                                      }
                                      /đêm
                                    </span>
                                    {selectedBookingRoom && isHigher && (
                                      <Badge
                                        variant="outline"
                                        className="text-[10px] border-emerald-200 text-emerald-700 bg-emerald-50 h-5"
                                      >
                                        +{" "}
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

              {/* STEP 3 & 4: CONFIGURATION */}
              {selectedNewRoomId && !validationMessage && (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
                  <Separator />

                  {/* Loại Upgrade */}
                  <FormField
                    control={form.control}
                    name="isFree"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-sm font-semibold flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="h-6 w-6 rounded-full p-0 flex items-center justify-center border-primary text-primary"
                          >
                            3
                          </Badge>
                          Hình thức nâng cấp
                        </FormLabel>
                        <FormControl>
                          <RadioGroup
                            value={field.value ? "free" : "paid"}
                            onValueChange={(val) => {
                              field.onChange(val === "free");
                              if (val === "free") {
                                form.setValue("paidAmount", 0);
                                form.setValue("paymentMethod", undefined);
                              }
                            }}
                            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                          >
                            <Card
                              className={cn(
                                "p-4 cursor-pointer border-2 transition-all",
                                field.value
                                  ? "border-emerald-500 bg-emerald-50/30"
                                  : "border-transparent"
                              )}
                            >
                              <RadioGroupItem
                                value="free"
                                id="free"
                                className="sr-only"
                              />
                              <Label
                                htmlFor="free"
                                className="cursor-pointer block"
                              >
                                <div className="flex items-center gap-2 font-semibold text-emerald-700">
                                  <Gift className="h-4 w-4" /> Complimentary
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  Miễn phí, không tạo invoice.
                                </div>
                              </Label>
                            </Card>

                            <Card
                              className={cn(
                                "p-4 cursor-pointer border-2 transition-all",
                                !field.value
                                  ? "border-primary bg-primary/5"
                                  : "border-transparent"
                              )}
                            >
                              {/* COMPONENT PAID GIỮ NGUYÊN */}
                              <RadioGroupItem
                                value="paid"
                                id="paid"
                                className="sr-only"
                              />
                              <Label
                                htmlFor="paid"
                                className="cursor-pointer block"
                              >
                                <div className="flex items-center gap-2 font-semibold text-primary">
                                  <CreditCard className="h-4 w-4" /> Paid
                                  Upgrade
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  Thu phí chênh lệch:{" "}
                                  <span className="font-mono font-bold text-foreground">
                                    {formatMoney(surcharge).vndFormatted}
                                  </span>
                                </div>
                              </Label>
                            </Card>
                          </RadioGroup>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Logic Form Fields Dynamic */}
                  <div className="pl-8 border-l-2 border-muted ml-3 space-y-4">
                    {isFree ? (
                      <FormField
                        control={form.control}
                        name="reason"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold">
                              Lý do miễn phí{" "}
                              <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Nhập lý do (bắt buộc)..."
                                {...field}
                                className="resize-none"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ) : (
                      <>
                        {/* Payment Methods - Giữ nguyên logic */}
                        <div className="flex flex-col gap-4">
                          <FormField
                            control={form.control}
                            name="paymentMethod"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs font-semibold">
                                  Thanh toán ngay (Tùy chọn)
                                </FormLabel>
                                <Select
                                  value={field.value}
                                  onValueChange={field.onChange}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Chọn phương thức thanh toán..." />
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
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          {paymentMethod && (
                            <FormField
                              control={form.control}
                              name="paidAmount"
                              render={({ field }) => (
                                <FormItem>
                                  <div className="flex justify-between items-center mb-1.5">
                                    <FormLabel className="text-xs font-semibold">
                                      Số tiền thu
                                    </FormLabel>
                                    <div className="flex gap-1">
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-5 text-[10px] px-2"
                                        onClick={() => handleQuickAmount(1)}
                                      >
                                        Max
                                      </Button>
                                    </div>
                                  </div>
                                  <div className="relative">
                                    <Input
                                      type="number"
                                      endAddon={
                                        <span className="text-xs text-muted-foreground">
                                          VND
                                        </span>
                                      }
                                      {...field}
                                      max={surcharge}
                                    />
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Validation Alert */}
              {validationMessage && (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 text-red-700 border border-red-200">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <p className="text-sm font-medium">{validationMessage}</p>
                </div>
              )}
            </div>
          </Form>
        </div>

        <DialogFooter className="px-6 py-4 bg-muted/5 border-t gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isUpgrading}
          >
            Đóng
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              !selectedBookingRoomId ||
              !selectedNewRoomId ||
              !!validationMessage ||
              isUpgrading
            }
            className="min-w-[140px]"
          >
            {isUpgrading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ArrowUpCircle className="mr-2 h-4 w-4" />
            )}
            {isUpgrading ? "Đang xử lý..." : "Xác nhận Upgrade"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
