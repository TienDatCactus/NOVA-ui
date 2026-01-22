import {
  AlertCircle,
  ArrowUpCircle,
  BedDouble,
  Check,
  CreditCard,
  Gift,
  Loader2,
} from "lucide-react";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
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
import { useUpdateBooking } from "~/routes/reservation/bookings/container/booking-mutation.hooks";
import { useAvailableRoomsForChange } from "~/routes/reservation/bookings/container/booking-query.hooks";
import { createChangeRoomOperation } from "~/services/api/booking/booking.helpers";
import type { BookingDetailResponseDto } from "~/services/api/booking/dto";
import {
  calculateRemainingNights,
  calculateUpgradeSurcharge,
  getUpgradeValidationMessage,
} from "../../container/upgrade-room-calculator";

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
  const form = useForm<{
    bookingRoomId: string;
    newRoomId: string;
    isFreeChange: boolean;
    reason: string;
  }>({
    defaultValues: {
      bookingRoomId: "",
      newRoomId: "",
      isFreeChange: false,
      reason: "",
    },
    mode: "onChange", // Validate realtime
  });

  const selectedBookingRoomId = form.watch("bookingRoomId");
  const selectedNewRoomId = form.watch("newRoomId");
  const isFreeChange = form.watch("isFreeChange");

  const { mutate: updateBooking, isPending: isUpdating } = useUpdateBooking(
    bookingDetail?.id || "",
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
      bookingDetail.rooms &&
      bookingDetail.rooms.find(
        (r) => r.bookingRoomId === selectedBookingRoomId,
      ),
    [bookingDetail.rooms, selectedBookingRoomId],
  );

  const selectedNewRoom = useMemo(
    () => availableRooms?.find((r) => r.roomId === selectedNewRoomId),
    [availableRooms, selectedNewRoomId],
  );

  const remainingNights = useMemo(() => {
    return selectedBookingRoom?.checkinDate &&
      selectedBookingRoom.checkoutDate &&
      selectedNewRoom
      ? calculateRemainingNights(
          bookingDetail.status,
          selectedBookingRoom.checkinDate,
          selectedBookingRoom.checkoutDate,
        )
      : 0;
  }, [selectedBookingRoom, selectedNewRoom, bookingDetail.status]);

  const surcharge = useMemo(() => {
    return selectedBookingRoom && selectedNewRoom && !isFreeChange
      ? calculateUpgradeSurcharge(
          selectedBookingRoom.baseRate || 0,
          selectedNewRoom.baseRate || 0,
          remainingNights,
        )
      : 0;
  }, [selectedBookingRoom, selectedNewRoom, isFreeChange, remainingNights]);

  const validationMessage = useMemo(() => {
    return selectedBookingRoom && selectedNewRoom
      ? getUpgradeValidationMessage(selectedBookingRoom.baseRate || 0)
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

    // Validate free upgrade requires reason
    if (
      data.isFreeChange &&
      (!data.reason || data.reason.trim().length === 0)
    ) {
      form.setError("reason", {
        type: "manual",
        message: "Vui lòng nhập lý do upgrade miễn phí",
      });
      return;
    }

    try {
      const changeOperation = createChangeRoomOperation(
        data.bookingRoomId,
        data.newRoomId,
        undefined,
        undefined,
        data.isFreeChange,
      );

      updateBooking(
        {
          rooms: [changeOperation],
          note:
            data.isFreeChange && data.reason
              ? `[Upgrade miễn phí] ${data.reason}`
              : undefined,
        },
        {
          onSuccess: () => {
            onOpenChange(false);
          },
        },
      );
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 flex flex-col gap-0 overflow-y-auto bg-background">
        {/* HEADER */}
        <DialogHeader className="px-6 py-4 border-b bg-muted/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <ArrowUpCircle className="h-6 w-6 text-primary" />
            </div>
            <div>
              <DialogTitle>Nâng cấp phòng (Upgrade)</DialogTitle>
              <DialogDescription>
                Chuyển đổi hạng phòng và tính toán chênh lệch giá.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* BODY */}
        <div className="px-6 py-6">
          <Form {...form}>
            <form className="space-y-8">
              {/* 1. SELECT ROOM */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs">
                    1
                  </span>
                  Chọn phòng hiện tại
                </h3>

                <FormField
                  control={form.control}
                  name="bookingRoomId"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(val) => {
                        field.onChange(val);
                        // Reset logic...
                      }}
                    >
                      <SelectTrigger className="h-14 bg-card">
                        <SelectValue placeholder="Chọn phòng cần nâng cấp..." />
                      </SelectTrigger>
                      <SelectContent>
                        {bookingDetail.rooms &&
                          bookingDetail.rooms.map((room) => (
                            <SelectItem
                              key={room.bookingRoomId}
                              value={room.bookingRoomId || ""}
                            >
                              <div className="flex items-center gap-3">
                                <div className="p-1 bg-muted rounded">
                                  <BedDouble className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div className="text-left">
                                  <div className="font-semibold">
                                    {room.roomName}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {room.roomTypeName} •{" "}
                                    {
                                      formatMoney(room.baseRate || 0)
                                        .vndFormatted
                                    }
                                  </div>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* 2. SELECT UPGRADE OPTION */}
              {selectedBookingRoomId && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs">
                      2
                    </span>
                    Chọn hạng phòng mới
                  </h3>

                  {/* Skeleton or Content */}

                  <div className="max-h-64 overflow-y-auto pr-2">
                    {isLoadingRooms ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Skeleton className="h-24 w-full rounded-xl" />
                        <Skeleton className="h-24 w-full rounded-xl" />
                      </div>
                    ) : availableRooms?.length === 0 ? (
                      <div className="p-8 border border-dashed rounded-xl text-center bg-muted/20">
                        <p className="text-sm text-muted-foreground">
                          Không có hạng phòng cao hơn khả dụng cho khoảng thời
                          gian này.
                        </p>
                      </div>
                    ) : (
                      <FormField
                        control={form.control}
                        name="newRoomId"
                        render={({ field }) => (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {availableRooms?.map((room) => {
                              const isSelected = field.value === room.roomId;
                              const priceDiff =
                                room.baseRate -
                                (selectedBookingRoom?.baseRate || 0);
                              const hasConflict = !!room.conflictInfo;

                              return (
                                <div
                                  key={room.roomId}
                                  onClick={() => {
                                    if (!hasConflict) {
                                      field.onChange(room.roomId);
                                    }
                                  }}
                                  className={cn(
                                    "rounded-xl border-2 p-4 transition-all relative overflow-hidden",
                                    hasConflict
                                      ? "cursor-not-allowed opacity-60 bg-muted/50 border-muted"
                                      : "cursor-pointer hover:shadow-md",
                                    !hasConflict && isSelected
                                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                                      : !hasConflict
                                        ? "border-muted bg-card hover:border-primary/50"
                                        : "",
                                  )}
                                >
                                  {isSelected && !hasConflict && (
                                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground p-1 rounded-bl-xl">
                                      <Check className="h-3 w-3" />
                                    </div>
                                  )}

                                  {hasConflict && (
                                    <div className="absolute top-0 right-0 bg-destructive text-destructive-foreground p-1 rounded-bl-xl">
                                      <AlertCircle className="h-3 w-3" />
                                    </div>
                                  )}

                                  <div className="flex justify-between items-start mb-2">
                                    <div>
                                      <div className="font-bold text-foreground">
                                        {room.roomName}
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        {room.roomTypeName}
                                      </div>
                                    </div>
                                    <Badge
                                      variant={
                                        priceDiff > 0 ? "default" : "secondary"
                                      }
                                      className={cn(
                                        "ml-2 font-mono",
                                        priceDiff > 0
                                          ? "bg-emerald-600 hover:bg-emerald-700"
                                          : "",
                                      )}
                                    >
                                      {priceDiff > 0 ? "+" : ""}
                                      {formatMoney(priceDiff).vndFormatted}
                                    </Badge>
                                  </div>

                                  <div className="text-xs text-muted-foreground border-t border-dashed pt-2 mt-2 flex justify-between">
                                    <span>
                                      Giá gốc:{" "}
                                      {formatMoney(room.baseRate).vndFormatted}
                                    </span>
                                    <span className="font-medium text-foreground">
                                      {room.availabilityStatus === "Available"
                                        ? "Có sẵn"
                                        : "Đang giữ"}
                                    </span>
                                  </div>

                                  {hasConflict && room.conflictInfo && (
                                    <div className="mt-2 pt-2 border-t border-destructive/30 flex items-start gap-2 text-xs text-destructive">
                                      <AlertCircle className="h-3 w-3 shrink-0 mt-0.5" />
                                      <span className="line-clamp-2">
                                        {room.conflictInfo.message}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* 3. CONFIRMATION DETAILS */}
              {selectedNewRoomId && !validationMessage && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <Separator />

                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs">
                      3
                    </span>
                    Hình thức thanh toán
                  </h3>

                  <FormField
                    control={form.control}
                    name="isFreeChange"
                    render={({ field }) => (
                      <RadioGroup
                        onValueChange={(val) => field.onChange(val === "free")}
                        value={field.value ? "free" : "paid"}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                      >
                        <Label
                          htmlFor="paid"
                          className={cn(
                            "flex flex-col gap-2 p-4 border-2 rounded-xl cursor-pointer hover:bg-muted/50 transition-all",
                            !field.value
                              ? "border-primary bg-primary/5"
                              : "border-muted",
                          )}
                        >
                          <RadioGroupItem
                            value="paid"
                            id="paid"
                            className="sr-only"
                          />
                          <div className="flex items-center gap-2 font-bold text-base">
                            <CreditCard className="h-5 w-5 text-primary" />
                            Thu phí chênh lệch
                          </div>
                          <div className="text-sm text-muted-foreground pl-7">
                            Khách sẽ trả thêm{" "}
                            <span className="font-mono font-bold text-foreground">
                              {formatMoney(surcharge).vndFormatted}
                            </span>
                            . Khoản này sẽ được thêm vào hóa đơn.
                          </div>
                        </Label>

                        <Label
                          htmlFor="free"
                          className={cn(
                            "flex flex-col gap-2 p-4 border-2 rounded-xl cursor-pointer hover:bg-muted/50 transition-all",
                            field.value
                              ? "border-emerald-500 bg-emerald-50/30"
                              : "border-muted",
                          )}
                        >
                          <RadioGroupItem
                            value="free"
                            id="free"
                            className="sr-only"
                          />
                          <div className="flex items-center gap-2 font-bold text-base text-emerald-700">
                            <Gift className="h-5 w-5" />
                            Miễn phí (Complimentary)
                          </div>
                          <div className="text-sm text-muted-foreground pl-7">
                            Nâng cấp miễn phí. Không phát sinh chi phí cho
                            khách.
                          </div>
                        </Label>
                      </RadioGroup>
                    )}
                  />

                  {isFreeChange && (
                    <FormField
                      control={form.control}
                      name="reason"
                      render={({ field }) => (
                        <FormItem className="pl-1">
                          <FormLabel>
                            Lý do miễn phí{" "}
                            <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="VD: Khách VIP, Sự cố phòng cũ..."
                              className="resize-none bg-muted/20"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              )}

              {/* Validation Error */}
              {validationMessage && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-4 flex items-center gap-3 text-red-800 animate-in zoom-in-95">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <p className="text-sm font-medium">{validationMessage}</p>
                </div>
              )}
            </form>
          </Form>
        </div>

        {/* FOOTER */}
        <DialogFooter className="px-6 py-4 bg-muted/10 border-t shrink-0">
          <div className="flex w-full justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isUpdating}
            >
              Hủy bỏ
            </Button>
            <Button
              onClick={handleSubmit} // Ensure handleSubmit is defined in your component logic
              disabled={
                !selectedBookingRoomId ||
                !selectedNewRoomId ||
                !!validationMessage ||
                isUpdating
              }
              className="min-w-[120px] shadow-lg shadow-primary/20"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang xử lý
                </>
              ) : (
                <>
                  <ArrowUpCircle className="mr-2 h-4 w-4" /> Xác nhận
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
