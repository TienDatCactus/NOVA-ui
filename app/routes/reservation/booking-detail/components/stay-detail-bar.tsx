import { ListTodo, Loader, Pen, Receipt, Wallet } from "lucide-react";
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

interface StayDetailBarProps {
  bookingCode: string;
  bookingDetail: BookingDetailResponseDto;
  form: UseFormReturn<StaffUpdateBookingRequestDto>;
  permissions: {
    canEditDates: boolean;
    blockReason?: string | null;
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
  const { mutate: updateBookingStatus, isPending: isUpdatingStatus } =
    useUpdateBookingStatus(bookingDetail.id!);
  const handleUpdateBookingStatus = (
    status: z.infer<typeof BookingSchema.BookingStatusEnum>
  ) => {
    updateBookingStatus(status);
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
              <Button
                onClick={() => setNoteModalOpen(true)}
                variant="outline"
                type="button"
              >
                <Pen />
                Ghi chú
              </Button>
              {bookingDetail.status === "Confirmed" && (
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

                          {/* Paid Amount */}
                          <FormField
                            control={paymentForm.control}
                            name="paidAmount"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Số tiền thanh toán</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="Nhập số tiền"
                                    {...field}
                                    onChange={(e) =>
                                      field.onChange(
                                        parseFloat(e.target.value) || 0
                                      )
                                    }
                                  />
                                </FormControl>
                                <FormDescription>
                                  Số tiền tối thiểu: 0.01 VNĐ
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Card className="p-4 bg-white gap-0 rounded-lg space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                Tổng tiền:
                              </span>
                              <span className="font-mono font-semibold">
                                {bookingDetail?.totalAmount?.toLocaleString(
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
                                {bookingDetail?.paidAmount?.toLocaleString(
                                  "vi-VN"
                                )}{" "}
                                VNĐ
                              </span>
                            </div>
                            <Separator />
                            <div className="flex justify-between text-sm font-semibold">
                              <span>Còn lại:</span>
                              <span className="font-mono text-destructive">
                                {(
                                  (bookingDetail?.totalAmount || 0) -
                                  (bookingDetail?.paidAmount || 0)
                                ).toLocaleString("vi-VN")}{" "}
                                VNĐ
                              </span>
                            </div>
                          </Card>
                        </div>

                        <div className="flex justify-end gap-2">
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
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
