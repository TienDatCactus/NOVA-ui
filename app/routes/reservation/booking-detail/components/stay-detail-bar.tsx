import { zodResolver } from "@hookform/resolvers/zod";
import { isAfter, isBefore, isSameDay, parseISO, startOfDay } from "date-fns";
import {
  ArrowRight,
  CalendarDays,
  CreditCard,
  DollarSign,
  DoorOpen,
  MoreHorizontal,
  Moon,
  PenLine,
  Receipt,
  UserX,
  XCircle,
  AlertCircle,
  FileText,
  Wallet,
} from "lucide-react";
import { useMemo } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import type z from "zod";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { DatePicker } from "~/components/ui/date-picker";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

import { BookingSchema } from "~/services/api/booking/booking.schema";
import { BOOKING_STATUSES } from "~/services/api/booking/booking.types";
import type {
  BookingDetailResponseDto,
  ConfirmBookingPaymentRequestDto,
  StaffUpdateBookingRequestDto,
} from "~/services/api/booking/dto";
import { PAYMENT_METHODS } from "~/services/types/payment.types";
import { useUpdateBookingStatus } from "../../bookings/container/booking-mutation.hooks";
import { useConfirmBookingPayment } from "../container/use-booking-checkout.hooks";
import type { BookingState } from "../container/use-booking-state.hooks";
import { AuthLoader, hasAnyRole, UserRole } from "~/lib/auth/auth.loader";

interface StayDetailBarProps {
  bookingCode: string;
  bookingDetail: BookingDetailResponseDto;
  form: UseFormReturn<StaffUpdateBookingRequestDto>;
  bookingState: BookingState;
  nights: number;
  setNoteModalOpen: (open: boolean) => void;
  handleSubmit: (data: StaffUpdateBookingRequestDto) => void;
}

export default function StayDetailBar({
  bookingCode,
  bookingDetail,
  form,
  bookingState,
  nights,
  setNoteModalOpen,
  handleSubmit,
}: StayDetailBarProps) {
  // --- Hooks ---
  const { mutateAsync: updateBookingStatus, isPending: isUpdatingStatus } =
    useUpdateBookingStatus(bookingDetail.id!);

  const { mutate: confirmPayment, isPending: isConfirmingPayment } =
    useConfirmBookingPayment(bookingDetail?.id || "");

  // --- Internal Form ---
  const paymentForm = useForm<ConfirmBookingPaymentRequestDto>({
    resolver: zodResolver(BookingSchema.ConfirmBookingPaymentRequestSchema),
    defaultValues: {
      paymentMethod: "Cash",
      paidAmount: 0,
    },
  });

  // --- Calculations ---
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
    };
  }, [bookingDetail, paidAmount]);

  const paymentValidation = useMemo(() => {
    const maxAllowed =
      paymentSummary.totalAmount - paymentSummary.previouslyPaid;

    if (paidAmount <= 0) {
      return { isValid: false, error: "Số tiền phải lớn hơn 0" };
    }

    if (paidAmount > maxAllowed) {
      return {
        isValid: false,
        error: `Số tiền không được vượt quá số tiền còn lại (${maxAllowed.toLocaleString("vi-VN")} VND)`,
      };
    }

    return { isValid: true };
  }, [paidAmount, paymentSummary]);

  const buttonStates = useMemo(() => {
    const today = startOfDay(new Date());
    const checkinDate = startOfDay(parseISO(bookingDetail.checkinDate));
    const isTodayBeforeCheckin = isBefore(today, checkinDate);
    const isTodayAfterCheckin = isAfter(today, checkinDate);
    const canCheckIn =
      isAfter(today, checkinDate) || isSameDay(today, checkinDate);

    return {
      canCheckIn,
      canNoShow: isTodayAfterCheckin,
      isBeforeCheckin: isTodayBeforeCheckin,
    };
  }, [bookingDetail.checkinDate]);

  // --- Handlers ---
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

  return (
    <div className="flex-1">
      <Card className="shadow-sm overflow-hidden h-full gap-0  flex flex-col">
        {/* === HEADER === */}
        <CardHeader className="bg-muted/10 py-0 px-6 border-b shrink-0">
          <div className="flex justify-between items-center">
            {/* Identity */}
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <span className="text-[0.625rem] uppercase font-bold text-muted-foreground tracking-wider">
                  Booking ID
                </span>
                <div className="text-lg font-bold font-mono leading-none">
                  {bookingCode}
                </div>
              </div>
              <Separator orientation="vertical" className="h-8" />
              <Badge
                variant={
                  BOOKING_STATUSES.find((s) => s.value == bookingDetail.status)
                    ?.variant
                }
                className="rounded-md px-2.5 py-0.5 text-xs font-medium"
              >
                {
                  BOOKING_STATUSES.find((s) => s.value == bookingDetail.status)
                    ?.label
                }
              </Badge>
              {/* Permission Alert (Inline) */}
              {!bookingState.permissions.canEditDates && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="h-full flex items-center justify-center px-3 bg-muted/30 rounded-md cursor-help">
                        <AlertCircle className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>{bookingState.permissions.dateChangeBlockReason}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>

            {/* Actions Area */}
            <div className="flex items-center gap-2">
              {/* Primary Action: Check In */}
              {hasAnyRole(AuthLoader.getUser(), [UserRole.Receptionist]) &&
                buttonStates.canCheckIn &&
                bookingDetail.status === "Confirmed" && (
                  <Button
                    disabled={isUpdatingStatus}
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                    onClick={() => handleUpdateBookingStatus("CheckedIn")}
                    type="button"
                  >
                    <DoorOpen className="w-4 h-4 mr-2" /> Nhận phòng
                  </Button>
                )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setNoteModalOpen(true)}
              >
                <PenLine className="w-4 h-4 mr-2" />
                Ghi chú
              </Button>
              {/* Primary Action: Payment (Pending) */}
              {hasAnyRole(AuthLoader.getUser(), [UserRole.Receptionist]) &&
              bookingDetail.source === "RoomBlock" &&
              bookingDetail.status === "Pending" ? (
                <Button
                  disabled={isUpdatingStatus}
                  size="sm"
                  variant="success"
                  onClick={() => handleUpdateBookingStatus("Confirmed")}
                  type="button"
                >
                  <DoorOpen className="w-4 h-4 mr-2" /> Xác nhận bảo trì
                </Button>
              ) : bookingDetail.source !== "RoomBlock" ? (
                bookingDetail.status === "Pending" && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="info-outline" size="sm">
                        <Receipt className="w-4 h-4 mr-2" />
                        Xác nhận cọc
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md p-0 gap-0 overflow-hidden">
                      {/* HEADER */}
                      <DialogHeader className="px-6 py-4 border-b bg-muted/5">
                        <DialogTitle className="flex items-center gap-2">
                          <div className="p-2 bg-primary/10 rounded-full">
                            <Wallet className="w-5 h-5 text-primary" />
                          </div>
                          Thanh toán đặt cọc
                        </DialogTitle>
                        <DialogDescription>
                          Ghi nhận khoản thanh toán trước cho booking{" "}
                          <span className="font-mono font-medium text-foreground">
                            #{bookingCode}
                          </span>
                        </DialogDescription>
                      </DialogHeader>

                      <div className="p-6 space-y-6">
                        {/* SUMMARY CARD - Styled like a receipt */}
                        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                          <div className="p-4 space-y-3 bg-muted/30">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground flex items-center gap-2">
                                <FileText className="w-4 h-4" /> Tổng giá trị
                                booking
                              </span>
                              <span className="font-mono font-medium">
                                {paymentSummary.totalAmount.toLocaleString(
                                  "vi-VN"
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground flex items-center gap-2">
                                <CreditCard className="w-4 h-4" /> Đã thanh toán
                              </span>
                              <span className="font-mono font-medium text-muted-foreground">
                                {paymentSummary.previouslyPaid.toLocaleString(
                                  "vi-VN"
                                )}
                              </span>
                            </div>
                          </div>

                          <Separator />

                          <div className="p-4 flex justify-between items-center bg-primary/5">
                            <span className="text-sm font-semibold text-foreground uppercase tracking-wide">
                              Số tiền còn lại
                            </span>
                            <div className="text-right">
                              <span
                                className={`font-mono font-bold text-xl ${paymentSummary.remaining < 0 ? "text-orange-600" : "text-primary"}`}
                              >
                                {paymentSummary.remaining.toLocaleString(
                                  "vi-VN"
                                )}
                              </span>
                              <span className="text-xs text-muted-foreground ml-1">
                                VND
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* FORM */}
                        <Form {...paymentForm}>
                          <form
                            onSubmit={paymentForm.handleSubmit((data) => {
                              if (!paymentValidation.isValid) {
                                paymentForm.setError("paidAmount", {
                                  message: paymentValidation.error,
                                });
                                return;
                              }
                              confirmPayment(data);
                            })}
                            className="space-y-5"
                          >
                            <div className="space-y-4">
                              {/* Payment Method */}
                              <FormField
                                control={paymentForm.control}
                                name="paymentMethod"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>
                                      Phương thức thanh toán
                                    </FormLabel>
                                    <Select
                                      onValueChange={field.onChange}
                                      defaultValue={field.value}
                                    >
                                      <FormControl>
                                        <SelectTrigger className="h-11">
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
                                              <pm.icon className="w-4 h-4 text-muted-foreground" />
                                              <span>{pm.label}</span>
                                            </div>
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </FormItem>
                                )}
                              />

                              {/* Amount Field with Quick Actions */}
                              <FormField
                                control={paymentForm.control}
                                name="paidAmount"
                                render={({ field }) => (
                                  <FormItem>
                                    <div className="flex justify-between items-center mb-1.5">
                                      <FormLabel>Số tiền thu</FormLabel>
                                      {/* UX: Quick Fill Buttons */}
                                      <div className="flex gap-2">
                                        <Badge
                                          variant="outline"
                                          className="cursor-pointer hover:bg-muted font-normal"
                                          onClick={() =>
                                            paymentForm.setValue(
                                              "paidAmount",
                                              Math.round(
                                                paymentSummary.totalAmount * 0.5
                                              )
                                            )
                                          }
                                        >
                                          50%
                                        </Badge>
                                        <Badge
                                          variant="secondary"
                                          className="cursor-pointer hover:bg-primary/20 text-primary font-normal"
                                          onClick={() =>
                                            paymentForm.setValue(
                                              "paidAmount",
                                              paymentSummary.remaining
                                            )
                                          }
                                        >
                                          Tất cả
                                        </Badge>
                                      </div>
                                    </div>
                                    <FormControl>
                                      <div className="relative">
                                        <Input
                                          type="number"
                                          {...field}
                                          className="pl-3 pr-12 h-11 font-mono font-bold text-lg"
                                          onChange={(e) =>
                                            field.onChange(
                                              parseFloat(e.target.value) || 0
                                            )
                                          }
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
                                          VND
                                        </span>
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <DialogFooter className="pt-2">
                              <Button
                                type="submit"
                                className="w-full h-11 text-base font-medium shadow-md"
                                disabled={
                                  isConfirmingPayment ||
                                  !paymentValidation.isValid
                                }
                              >
                                {isConfirmingPayment ? (
                                  "Đang xử lý..."
                                ) : (
                                  <span className="flex items-center gap-2">
                                    Xác nhận thu tiền{" "}
                                    <ArrowRight className="w-4 h-4" />
                                  </span>
                                )}
                              </Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </div>
                    </DialogContent>
                  </Dialog>
                )
              ) : null}

              {/* Secondary Actions Menu */}
              {(bookingDetail.status === "Pending" ||
                bookingDetail.status === "Confirmed") && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Thao tác khác</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => handleUpdateBookingStatus("Cancelled")}
                    >
                      <XCircle className="w-4 h-4 mr-2" /> Hủy đặt phòng
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </CardHeader>

        {/* === BODY: TIMELINE & DATES === */}
        <CardContent className=" flex items-end gap-4 h-full">
          {/* Date Timeline */}
          <div className="flex-1 grid grid-cols-[1fr_auto_1fr]  items-end gap-4">
            {/* Check-in */}
            <FormField
              control={form.control}
              name="checkinDate"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-xs uppercase text-muted-foreground font-semibold flex items-center gap-1.5">
                    <CalendarDays className="w-3.5 h-3.5" /> Nhận phòng
                  </FormLabel>
                  <FormControl>
                    <DatePicker
                      {...field}
                      disabled={!bookingState.permissions.canEditDates}
                      className="w-full"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Duration Badge */}
            <div className="flex flex-col items-center justify-center pt-5 px-2">
              <div className="text-[0.625rem] text-muted-foreground uppercase font-bold mb-1 tracking-wider">
                Lưu trú
              </div>
              <Badge
                variant="secondary"
                className="rounded-full px-3 py-1 flex items-center gap-1.5 bg-primary/10 text-primary border-primary/20"
              >
                <Moon className="w-3 h-3" />
                <span className="font-mono text-sm">{nights}</span> đêm
              </Badge>
              <ArrowRight className="w-4 h-4 text-muted-foreground mt-1" />
            </div>

            {/* Check-out */}
            <FormField
              control={form.control}
              name="checkoutDate"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-xs uppercase text-muted-foreground font-semibold flex items-center gap-1.5">
                    <CalendarDays className="w-3.5 h-3.5" /> Trả phòng
                  </FormLabel>
                  <FormControl>
                    <DatePicker
                      {...field}
                      disabled={!bookingState.permissions.canEditDates}
                      className="w-full"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          {/* Notes Trigger */}
        </CardContent>
      </Card>
    </div>
  );
}
