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
    <form onSubmit={form.handleSubmit(handleSubmit)} className="flex-1">
      <Card className="shadow-sm overflow-hidden h-full gap-0  flex flex-col">
        {/* === HEADER === */}
        <CardHeader className="bg-muted/10 py-0 px-6 border-b shrink-0">
          <div className="flex justify-between items-center">
            {/* Identity */}
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
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
              {!permissions.canEditDates && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="h-full flex items-center justify-center px-3 bg-muted/30 rounded-md cursor-help">
                        <AlertCircle className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>{permissions.dateChangeBlockReason}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>

            {/* Actions Area */}
            <div className="flex items-center gap-2">
              {/* Primary Action: Check In */}
              {buttonStates.canCheckIn &&
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
                onClick={() => setNoteModalOpen(true)}
              >
                <PenLine className="w-4 h-4 mr-2" />
                Ghi chú
              </Button>
              {/* Primary Action: Payment (Pending) */}
              {bookingDetail.status === "Pending" && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-primary/50 text-primary hover:bg-primary/5 relative"
                    >
                      <Receipt className="w-4 h-4 mr-2" />
                      Xác nhận cọc
                      <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                      </span>
                    </Button>
                  </DialogTrigger>
                  {/* Payment Dialog Content (Refactored) */}
                  <DialogContent className="max-w-md p-0 gap-0">
                    <DialogHeader className="px-6 py-4 border-b bg-muted/5">
                      <DialogTitle className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-primary" />
                        Thanh toán đặt cọc
                      </DialogTitle>
                      <DialogDescription>
                        Ghi nhận khoản thanh toán trước cho booking #
                        {bookingCode}
                      </DialogDescription>
                    </DialogHeader>

                    <div className="p-6 space-y-6">
                      {/* Summary Card */}
                      <div className="bg-muted/20 rounded-lg p-4 space-y-3 border">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Tổng giá trị:
                          </span>
                          <span className="font-mono font-semibold">
                            {paymentSummary.totalAmount.toLocaleString("vi-VN")}{" "}
                            VND
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
                            VND
                          </span>
                        </div>
                        <Separator />
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-bold text-foreground">
                            Còn lại:
                          </span>
                          <span
                            className={`font-mono font-bold text-lg ${paymentSummary.remaining < 0 ? "text-orange-600" : "text-primary"}`}
                          >
                            {paymentSummary.remaining.toLocaleString("vi-VN")}{" "}
                            VND
                          </span>
                        </div>
                      </div>

                      <Form {...paymentForm}>
                        <form
                          onSubmit={paymentForm.handleSubmit((data) =>
                            confirmPayment(data)
                          )}
                          className="space-y-4"
                        >
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={paymentForm.control}
                              name="paymentMethod"
                              render={({ field }) => (
                                <FormItem className="col-span-2 sm:col-span-1">
                                  <FormLabel>Phương thức</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger className="w-40">
                                        <SelectValue />
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
                                            <pm.icon className="w-3.5 h-3.5" />
                                            {pm.label}
                                          </div>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={paymentForm.control}
                              name="paidAmount"
                              render={({ field }) => (
                                <FormItem className="col-span-2 sm:col-span-1">
                                  <FormLabel>Số tiền thu</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Input
                                        type="number"
                                        {...field}
                                        className="pr-12 text-right font-mono font-bold"
                                        onChange={(e) =>
                                          field.onChange(
                                            parseFloat(e.target.value) || 0
                                          )
                                        }
                                      />
                                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                                        VND
                                      </span>
                                    </div>
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                          <DialogClose asChild>
                            <Button
                              type="submit"
                              className="w-full mt-2"
                              disabled={isConfirmingPayment}
                            >
                              {isConfirmingPayment
                                ? "Đang xử lý..."
                                : "Xác nhận đã thu tiền"}
                            </Button>
                          </DialogClose>
                        </form>
                      </Form>
                    </div>
                  </DialogContent>
                </Dialog>
              )}

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
                      onClick={() => handleUpdateBookingStatus("Cancelled")}
                      className="text-destructive focus:text-destructive"
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
                      disabled={!permissions.canEditDates}
                      className="w-full"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Duration Badge */}
            <div className="flex flex-col items-center justify-center pt-5 px-2">
              <div className="text-[10px] text-muted-foreground uppercase font-bold mb-1 tracking-wider">
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
                      disabled={!permissions.canEditDates}
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
    </form>
  );
}
