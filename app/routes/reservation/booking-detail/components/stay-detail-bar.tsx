import {
  ListTodo,
  Loader,
  Pen,
  Receipt,
  Wallet,
  XCircle,
  UserX,
} from "lucide-react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { DatePicker } from "~/components/ui/date-picker";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { BOOKING_STATUSES } from "~/services/api/booking/booking.types";
import type {
  BookingDetailResponseDto,
  ConfirmBookingPaymentRequestDto,
  StaffUpdateBookingRequestDto,
} from "~/services/api/booking/dto";
import { useUpdateBookingStatus } from "../../bookings/container/booking-mutation.hooks";
import type z from "zod";
import { BookingSchema } from "~/services/api/booking/booking.schema";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";

import { PAYMENT_METHODS } from "~/services/types/payment.types";
import { useConfirmBookingPayment } from "../container/use-booking-checkout.hooks";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import { useMemo } from "react";
import { isAfter, isBefore, isSameDay, parseISO, startOfDay } from "date-fns";

interface StayDetailBarProps {
  bookingCode: string;
  bookingDetail: BookingDetailResponseDto;
  form: UseFormReturn<StaffUpdateBookingRequestDto>;
  permissions: {
    canEditDates: boolean;
    blockReason?: string | null;
    dateChangeBlockReason?: string | null;
  };
  nights: number;
  setNoteModalOpen: (open: boolean) => void;
  handleSubmit: (data: StaffUpdateBookingRequestDto) => void;
}

export default function StayDetailBar({
  bookingCode,
  bookingDetail,
  form,
  permissions,
  nights,
  setNoteModalOpen,
  handleSubmit,
}: StayDetailBarProps) {
  const { mutateAsync: updateBookingStatus, isPending: isUpdatingStatus } =
    useUpdateBookingStatus(bookingDetail.id!);
  const handleUpdateBookingStatus = async (
    status: z.infer<typeof BookingSchema.BookingStatusEnum>
  ) => {
    if (status === "CheckedIn") {
      await updateBookingStatus("CheckedIn");
      await updateBookingStatus("InHouse");
    } else {
      updateBookingStatus(status);
    }
  };
  const { mutate: confirmPayment, isPending: isConfirmingPayment } =
    useConfirmBookingPayment(bookingDetail?.id || "");

  const paymentForm = useForm<ConfirmBookingPaymentRequestDto>({
    resolver: zodResolver(BookingSchema.ConfirmBookingPaymentRequestSchema),
    defaultValues: {
      paymentMethod: "Cash",
      paidAmount: 0,
    },
  });

  // Watch paidAmount để tính số tiền còn lại động
  const paidAmount = paymentForm.watch("paidAmount");

  const paymentSummary = useMemo(() => {
    const totalAmount = bookingDetail?.totalAmount || 0;
    const previouslyPaid = bookingDetail?.paidAmount || 0;
    const currentPaid = paidAmount || 0;
    const remaining = totalAmount - previouslyPaid - currentPaid;

    return {
      totalAmount,
      previouslyPaid,
      currentPaid,
      remaining,
      newTotal: previouslyPaid + currentPaid,
    };
  }, [bookingDetail, paidAmount]);

  // Check date conditions for button states
  const buttonStates = useMemo(() => {
    const today = startOfDay(new Date());
    const checkinDate = startOfDay(parseISO(bookingDetail.checkinDate));

    // Hôm nay < ngày check-in → disable cả nhận phòng và no show
    const isTodayBeforeCheckin = isBefore(today, checkinDate);

    // Hôm nay > ngày check-in → enable no show
    const isTodayAfterCheckin = isAfter(today, checkinDate);

    // Hôm nay >= ngày check-in → enable nhận phòng
    const canCheckIn =
      isAfter(today, checkinDate) || isSameDay(today, checkinDate);

    return {
      canCheckIn,
      canNoShow: isTodayAfterCheckin,
      isBeforeCheckin: isTodayBeforeCheckin,
    };
  }, [bookingDetail.checkinDate]);

  return (
    <form
      onSubmit={form.handleSubmit(handleSubmit)}
      className="space-y-6 flex-1"
    >
      <Card className="shadow-sm px-0 py-4">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex gap-1">
              <h1>Thông tin đặt phòng: {bookingCode}</h1>
              <sup>
                <Badge
                  variant={
                    BOOKING_STATUSES.find(
                      (status) => status.value == bookingDetail.status
                    )?.variant
                  }
                >
                  {
                    BOOKING_STATUSES.find(
                      (status) => status.value == bookingDetail.status
                    )?.label
                  }
                </Badge>
              </sup>
            </CardTitle>

            <div className="flex items-center gap-2">
              {/* Cancel Button - for Pending/Confirmed */}
              {(bookingDetail.status === "Pending" ||
                bookingDetail.status === "Confirmed") && (
                <Button
                  disabled={isUpdatingStatus}
                  variant="destructive-outline"
                  onClick={() => handleUpdateBookingStatus("Cancelled")}
                  type="button"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Hủy booking
                </Button>
              )}

              {/* No Show Button - for Confirmed only */}
              {buttonStates.canNoShow &&
                bookingDetail.status === "Confirmed" && (
                  <Button
                    disabled={isUpdatingStatus}
                    variant="destructive"
                    onClick={() => handleUpdateBookingStatus("NoShow")}
                    type="button"
                    title={
                      !buttonStates.canNoShow
                        ? "Chỉ có thể đánh dấu No Show sau ngày check-in"
                        : ""
                    }
                  >
                    <UserX className="w-4 h-4 mr-2" />
                    No Show
                  </Button>
                )}

              {/* Check-in Button - for Confirmed (goes directly to InHouse) */}
              {buttonStates.canCheckIn &&
                bookingDetail.status === "Confirmed" && (
                  <Button
                    disabled={isUpdatingStatus}
                    variant={"success"}
                    onClick={() => handleUpdateBookingStatus("CheckedIn")}
                    type="button"
                  >
                    <ListTodo />
                    Nhận phòng
                  </Button>
                )}

              {/* Payment Confirmation Dialog - for Pending */}
              {bookingDetail.status === "Pending" && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant={"success-outline"} className="relative">
                      <Receipt className="w-4 h-4 mr-2" />
                      Xác nhận thanh toán
                      <Badge
                        variant={"destructive"}
                        className="rounded-full w-4 h-4 absolute -top-2 -right-2"
                      >
                        !
                      </Badge>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Xác nhận thanh toán</DialogTitle>
                      <DialogDescription>
                        Xác nhận thanh toán cho đặt phòng #
                        {bookingDetail?.bookingCode}
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...paymentForm}>
                      <form
                        onSubmit={paymentForm.handleSubmit((data) =>
                          confirmPayment(data)
                        )}
                        className="space-y-4"
                      >
                        <div className="space-y-4">
                          <FormField
                            control={paymentForm.control}
                            name="paymentMethod"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phương thức thanh toán</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger className="w-full">
                                      <SelectValue placeholder="Chọn phương thức" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {PAYMENT_METHODS.filter(
                                      (pm) => !pm.disabled
                                    ).map((pm) => (
                                      <SelectItem
                                        key={pm.value}
                                        value={pm.value}
                                      >
                                        <div className="flex items-center gap-2">
                                          <pm.icon className="w-4 h-4" />
                                          {pm.label}
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
                            control={paymentForm.control}
                            name="paidAmount"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Số tiền thanh toán</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    placeholder="Nhập số tiền"
                                    {...field}
                                    onChange={(e) => {
                                      const inputValue = e.target.value;
                                      const maxAmount =
                                        paymentSummary.totalAmount -
                                        paymentSummary.previouslyPaid;

                                      // Parse giá trị
                                      if (inputValue === "") {
                                        field.onChange(0);
                                        return;
                                      }

                                      const parsed = parseFloat(inputValue);
                                      if (isNaN(parsed) || parsed < 0) {
                                        field.onChange(0);
                                        return;
                                      }

                                      // Giới hạn không quá maxAmount
                                      const value =
                                        parsed > maxAmount ? maxAmount : parsed;
                                      field.onChange(value);
                                    }}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Tối thiểu: 0.01 VNĐ • Tối đa:{" "}
                                  {(
                                    paymentSummary.totalAmount -
                                    paymentSummary.previouslyPaid
                                  ).toLocaleString("vi-VN")}{" "}
                                  VNĐ
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <Card className="p-4 bg-muted gap-0 rounded-lg space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                Tổng tiền:
                              </span>
                              <span className="font-mono font-semibold">
                                {paymentSummary.totalAmount.toLocaleString(
                                  "vi-VN"
                                )}{" "}
                                VNĐ
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                Đã thanh toán:
                              </span>
                              <span className="font-mono">
                                {paymentSummary.previouslyPaid.toLocaleString(
                                  "vi-VN"
                                )}{" "}
                                VNĐ
                              </span>
                            </div>
                            {paymentSummary.currentPaid > 0 && (
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">
                                  Thanh toán lần này:
                                </span>
                                <span className="font-mono text-primary font-semibold">
                                  +
                                  {paymentSummary.currentPaid.toLocaleString(
                                    "vi-VN"
                                  )}{" "}
                                  VNĐ
                                </span>
                              </div>
                            )}
                            <Separator />
                            <div className="flex justify-between text-sm font-semibold">
                              <span>Còn lại:</span>
                              <span
                                className={`font-mono ${
                                  paymentSummary.remaining === 0
                                    ? "text-green-600"
                                    : paymentSummary.remaining < 0
                                      ? "text-orange-600"
                                      : "text-destructive"
                                }`}
                              >
                                {paymentSummary.remaining.toLocaleString(
                                  "vi-VN"
                                )}{" "}
                                VNĐ
                              </span>
                            </div>
                            {paymentSummary.remaining === 0 &&
                              paymentSummary.currentPaid > 0 && (
                                <div className="text-xs text-green-600 text-center pt-2">
                                  ✓ Đã thanh toán đủ
                                </div>
                              )}
                            {paymentSummary.remaining < 0 && (
                              <div className="text-xs text-orange-600 text-center pt-2">
                                Thanh toán thừa{" "}
                                {Math.abs(
                                  paymentSummary.remaining
                                ).toLocaleString("vi-VN")}{" "}
                                VNĐ
                              </div>
                            )}
                          </Card>
                        </div>

                        <div className="flex justify-end gap-2">
                          <DialogClose asChild>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                paymentForm.reset();
                              }}
                              disabled={isConfirmingPayment}
                            >
                              Hủy
                            </Button>
                          </DialogClose>
                          <Button type="submit" disabled={isConfirmingPayment}>
                            {isConfirmingPayment
                              ? "Xử lý..."
                              : "Xác nhận thanh toán"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {!permissions.canEditDates && permissions.dateChangeBlockReason && (
            <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground border border-border">
              <p className="font-medium text-foreground mb-1">
                Không thể thay đổi ngày check-in/check-out
              </p>
              <p>{permissions.dateChangeBlockReason}</p>
            </div>
          )}

          <div className="flex items-center gap-6">
            <FormField
              control={form.control}
              name="checkinDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Ngày nhận phòng</FormLabel>
                  <FormControl>
                    <DatePicker
                      {...field}
                      defaultMonth={new Date(field.value || "")}
                      disabled={!permissions.canEditDates}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="checkoutDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Ngày trả phòng</FormLabel>
                  <FormControl>
                    <DatePicker
                      defaultMonth={new Date(field.value || "")}
                      {...field}
                      disabled={!permissions.canEditDates}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-2">
              <span className="text-sm font-medium">Số đêm:</span>
              <span className="text-lg font-bold text-primary">
                {nights} đêm
              </span>
            </div>
            <div className="grid gap-2">
              <span className="text-sm font-medium">Ghi chú:</span>
              <Input
                startAddon={<Pen />}
                className="w-36"
                placeholder="Ghi chú về đơn đặt phòng"
                onFocus={() => setNoteModalOpen(true)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
