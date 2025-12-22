import {
  Baby,
  Building2,
  Globe,
  Mail,
  Phone,
  User,
  Utensils,
  Wallet,
} from "lucide-react";
import type { UseFormReturn } from "react-hook-form";

import {
  FormControl,
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
import { Counter } from "~/components/ui/shadcn-io/button-group/advanced/counter";
import { Switch } from "~/components/ui/switch";
import type {
  BookingDetailResponseDto,
  StaffUpdateBookingRequestDto,
} from "~/services/api/booking/dto";
import type { BookingState } from "../container/use-booking-state.hooks";

interface CustomerInfoBarProps {
  bookingDetail: BookingDetailResponseDto;
  form: UseFormReturn<StaffUpdateBookingRequestDto>;
  OTAList?: Array<{ id: string; name: string }>;
  bookingState: BookingState;
}

export default function CustomerInfoBar({
  bookingDetail,
  form,
  OTAList,
  bookingState,
}: CustomerInfoBarProps) {
  return (
    <div className="bg-background  hover:border-primary border rounded-lg p-5 shadow-sm">
      <div className="flex flex-col gap-4">
        <div className="space-y-4 border-b ">
          <div className="space-y-1">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <User className="w-3.5 h-3.5" /> Khách hàng
            </h3>
            <div
              className="font-medium text-lg text-foreground truncate"
              title={bookingDetail.customer.fullName}
            >
              {bookingDetail.customer.fullName}
            </div>
          </div>

          <div className="space-y-2">
            {(bookingDetail.customer.email ||
              bookingDetail.customer.phoneNumber) && (
              <div className="space-y-2">
                {bookingDetail.customer.email && (
                  <a
                    href={`mailto:${bookingDetail.customer.email}`}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
                  >
                    <Mail className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
                    <span className="truncate">
                      {bookingDetail.customer.email}
                    </span>
                  </a>
                )}
                {bookingDetail.customer.phoneNumber && (
                  <a
                    href={`tel:${bookingDetail.customer.phoneNumber}`}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
                  >
                    <Phone className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
                    <span>{bookingDetail.customer.phoneNumber}</span>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        <div className=" space-y-5  ">
          <div className="felx flex-col gap-4">
            <FormField
              control={form.control}
              name="adultsAmount"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs uppercase text-muted-foreground font-semibold flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" /> Người lớn
                  </FormLabel>
                  <FormControl>
                    <Counter
                      {...field}
                      isDisabled={!bookingState.permissions.canEditGuests}
                      className="h-9"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="childrenAmount"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs uppercase text-muted-foreground font-semibold flex items-center gap-1.5">
                    <Baby className="h-3.5 w-3.5" /> Trẻ em
                  </FormLabel>
                  <FormControl>
                    <Counter
                      {...field}
                      isDisabled={!bookingState.permissions.canEditGuests}
                      className="h-9"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="includeBreakfast"
            render={({ field }) => {
              return (
                <FormItem className="flex items-center justify-between">
                  <FormLabel className="text-xs uppercase text-muted-foreground font-semibold flex items-center gap-1.5">
                    <Utensils className="h-3.5 w-3.5" /> Ăn sáng
                  </FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={!bookingState.permissions.canEditGuests}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        </div>

        <div className=" space-y-5">
          {form.watch("otaInformationId") ? (
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="otaInformationId"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-xs uppercase text-muted-foreground font-semibold flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5" /> Kênh OTA
                    </FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={!bookingState.permissions.canEdit}
                    >
                      <FormControl>
                        <SelectTrigger className="h-9 w-40 text-xs">
                          <SelectValue placeholder="Chọn kênh" />
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
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="otaBookingCode"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-xs uppercase text-muted-foreground font-semibold flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5" /> Mã OTA
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="h-9 font-mono text-xs"
                        placeholder="Mã đặt phòng"
                        disabled={!bookingState.permissions.canEdit}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ) : (
            <div className="hidden lg:flex h-[4.125rem] border-2 border-dashed rounded-md bg-muted/10 items-center justify-center text-xs font-medium text-muted-foreground/70">
              Đặt trực tiếp (Direct Booking)
            </div>
          )}

          <FormField
            control={form.control}
            name="totalAmount"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-xs uppercase text-muted-foreground font-semibold flex items-center gap-1.5">
                  <Wallet className="h-3.5 w-3.5" /> Tổng tiền dự kiến
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    className="font-mono font-bold text-lg text-right text-primary"
                    min={0}
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseFloat(e.target.value) || 0)
                    }
                    disabled={!bookingState.permissions.canEdit}
                    endAddon={
                      <span className="text-xs text-muted-foreground font-bold">
                        VND
                      </span>
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}
