import { Pen } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { DatePicker } from "~/components/ui/date-picker";
import {
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
  StaffUpdateBookingRequestDto,
} from "~/services/api/booking/dto";

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
              <Button variant={"success"} type="button">
                Nhận phòng
              </Button>
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
                  {!permissions.canEditDates && (
                    <FormDescription className="text-destructive text-xs">
                      {permissions.blockReason}
                    </FormDescription>
                  )}
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
                  {!permissions.canEditDates && (
                    <FormDescription className="text-destructive text-xs">
                      {permissions.blockReason}
                    </FormDescription>
                  )}
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
