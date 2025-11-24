import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { Baby, Mail, Phone, User, Utensils, Wallet } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { Card, CardContent } from "~/components/ui/card";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Counter } from "~/components/ui/shadcn-io/button-group/advanced/counter";
import type {
  BookingDetailResponseDto,
  StaffUpdateBookingRequestDto,
} from "~/services/api/booking/dto";

interface CustomerInfoBarProps {
  bookingDetail: BookingDetailResponseDto;
  form: UseFormReturn<StaffUpdateBookingRequestDto>;
  OTAList?: Array<{ id: string; name: string }>;
  permissions: {
    canDoSoftUpdate: boolean; // Legacy
    canUpdateNonStructural: boolean;
    canUpdateGuestCount: boolean;
    canUpdateTotalAmount: boolean;
  };
}

export default function CustomerInfoBar({
  bookingDetail,
  form,
  OTAList,
  permissions,
}: CustomerInfoBarProps) {
  return (
    <Card className="w-full h-fit shadow-sm">
      <CardContent className="flex items-start gap-4 flex-wrap">
        <div className="grid gap-2">
          <h1 className="uppercase font-medium text-card-foreground text-sm">
            Khách hàng
          </h1>
          <p className="text-sm">{bookingDetail.customer.fullName}</p>
        </div>
        {(bookingDetail.customer.email ||
          bookingDetail.customer.phoneNumber) && (
          <div className="grid gap-2">
            <h1 className="font-medium uppercase text-card-foreground text-sm">
              Phương thức liên lạc
            </h1>
            <div className="flex flex-col gap-1 text-sm">
              {bookingDetail.customer.email && (
                <a
                  href={`mailto:${bookingDetail.customer.email}`}
                  className="hover:underline flex items-center gap-2 "
                >
                  <Mail className="h-3 w-3" />
                  {bookingDetail.customer.email}
                </a>
              )}
              {bookingDetail.customer.phoneNumber && (
                <a
                  href={`tel:${bookingDetail.customer.phoneNumber}`}
                  className="hover:underline flex items-center gap-2"
                >
                  <Phone className="h-3 w-3" />
                  {bookingDetail.customer.phoneNumber}
                </a>
              )}
            </div>
          </div>
        )}

        <FormField
          control={form.control}
          name="adultsAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm uppercase text-card-foreground">
                Số lượng người lớn
              </FormLabel>
              <FormControl className="text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <Counter
                    className="w-30 "
                    {...field}
                    isDisabled={!permissions.canUpdateGuestCount}
                  />
                </div>
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        {form.watch("childrenAmount")! > 0 && (
          <FormField
            control={form.control}
            name="childrenAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm uppercase text-card-foreground">
                  Số lượng trẻ em
                </FormLabel>
                <FormControl>
                  <div className="flex items-center gap-2">
                    <Baby className="h-4 w-4" />
                    <Counter
                      className="w-30"
                      {...field}
                      isDisabled={!permissions.canUpdateGuestCount}
                    />
                  </div>
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Source */}
        {form.watch("otaInformationId") && (
          <div className="flex items-center gap-6">
            <FormField
              control={form.control}
              name="otaInformationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-card-foreground uppercase">
                    Nền tảng OTA
                  </FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full bg-secondary">
                            <SelectValue placeholder="Chọn nền tảng OTA" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {OTAList?.map((ota) => (
                            <SelectItem key={ota.id} value={ota.id}>
                              {ota.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="otaBookingCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-card-foreground uppercase">
                    Mã đặt phòng OTA
                  </FormLabel>
                  <FormControl>
                    <Input {...field} className="w-full bg-secondary" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
        {/* Breakfast Dates Picker */}
        <FormField
          control={form.control}
          name="breakfastDates"
          render={({ field }) => {
            const checkinDate = form.watch("checkinDate");
            const checkoutDate = form.watch("checkoutDate");
            const breakfastDates =
              field.value?.map((item) =>
                item.date ? parseISO(item.date) : new Date()
              ) || [];

            const handleSelectDates = (dates: Date[] | undefined) => {
              if (!dates) {
                field.onChange([]);
                return;
              }
              const formatted = dates.map((date) => ({
                date: format(date, "yyyy-MM-dd"),
              }));
              field.onChange(formatted);
            };

            return (
              <FormItem className="flex flex-col">
                <FormLabel className="text-sm uppercase text-card-foreground">
                  Ngày có bữa sáng
                </FormLabel>
                <FormControl>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                        disabled={!permissions.canDoSoftUpdate}
                      >
                        <Utensils className="mr-2 h-4 w-4" />
                        {breakfastDates.length > 0
                          ? `Đã chọn ${breakfastDates.length} ngày`
                          : "Chọn ngày có bữa sáng"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="multiple"
                        selected={breakfastDates}
                        onSelect={handleSelectDates}
                        disabled={(date) => {
                          const checkin =
                            checkinDate instanceof Date
                              ? checkinDate
                              : parseISO(checkinDate!.toString());
                          const checkout =
                            checkoutDate instanceof Date
                              ? checkoutDate
                              : parseISO(checkoutDate!.toString());
                          return date <= checkin || date >= checkout;
                        }}
                        locale={vi}
                      />
                    </PopoverContent>
                  </Popover>
                </FormControl>
                <FormDescription className="text-xs">
                  Chọn các ngày khách có sử dụng bữa sáng
                </FormDescription>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <FormField
          control={form.control}
          name="totalAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm text-card-foreground uppercase">
                Tổng tiền cần thanh toán
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  className="w-fit"
                  min={0}
                  {...field}
                  onChange={(value) =>
                    field.onChange(value.target.valueAsNumber)
                  }
                  startAddon={<Wallet />}
                  disabled={!permissions.canUpdateTotalAmount}
                />
              </FormControl>
              <FormDescription>
                Nhấn để cập nhật thông tin thanh toán
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
