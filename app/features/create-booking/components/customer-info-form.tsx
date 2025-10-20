import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { vi } from "react-day-picker/locale";
import type { UseFormReturn } from "react-hook-form";
import type z from "zod";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
  Form,
  FormControl,
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
import { ScrollArea } from "~/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Counter } from "~/components/ui/shadcn-io/counter";
import { BOOKING_CHANNEL } from "~/lib/constants";
import { cn } from "~/lib/utils";
import useBookingSchema from "~/services/schema/booking.schema";
import useCustomerInfoForm from "../container/customer-info-form.hooks";

function CustomerInfoForm({
  form,
}: {
  form: UseFormReturn<
    z.infer<ReturnType<typeof useBookingSchema>["BookingSchema"]>
  >;
}) {
  const { contact, setContact, hasContactInfo, bookingChannel } =
    useCustomerInfoForm({ form });
  return (
    <ScrollArea className="h-90 min-h-0">
      <Form {...form}>
        <div className="space-y-6 w-full max-w-[98%] mx-auto">
          <div className="grid grid-cols-1 gap-2">
            <FormField
              control={form.control}
              name="customerInfo.fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Họ và Tên</FormLabel>
                  <FormControl>
                    <Input placeholder="Nguyễn Văn A" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div
            className={cn("grid grid-cols-1 gap-2", {
              "grid-cols-3": hasContactInfo,
            })}
          >
            <FormItem>
              <FormLabel>Phương thức liên lạc</FormLabel>
              <Select
                value={contact}
                onValueChange={(value) => {
                  const newContact = value as "email" | "phoneNumber" | "none";
                  setContact(newContact);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn phương thức liên lạc" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Phương thức liên lạc</SelectLabel>
                    <SelectItem value="none">Không xác định</SelectItem>
                    <SelectItem value="phoneNumber">Số điện thoại</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </FormItem>

            {contact !== "none" && (
              <FormField
                key={contact}
                control={form.control}
                name={`customerInfo.${contact}`}
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>
                      {contact === "phoneNumber" ? "Số Điện Thoại" : "Email"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={
                          contact === "phoneNumber"
                            ? "0123456789"
                            : "example@email.com"
                        }
                        type={contact === "phoneNumber" ? "tel" : "email"}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

          <div
            className={cn("grid grid-cols-4 gap-2", {
              "grid-cols-5": bookingChannel && bookingChannel !== "Direct",
            })}
          >
            <FormField
              control={form.control}
              name="customerInfo.adults"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số lượng người lớn</FormLabel>
                  <FormControl>
                    <Counter
                      id={field.name}
                      number={field.value ?? 0}
                      setNumber={field.onChange}
                      max={20}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customerInfo.children"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trẻ em (&lt; 3 tuổi)</FormLabel>
                  <FormControl>
                    <Counter
                      number={field.value ?? 0}
                      setNumber={field.onChange}
                      max={20}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customerInfo.bookingChannel"
              render={({ field }) => (
                <FormItem
                  className={cn("col-span-2", {
                    "col-span-1": bookingChannel && bookingChannel !== "Direct",
                  })}
                >
                  <FormLabel>Kênh Đặt Phòng</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      if (value === "Direct") {
                        form.setValue("customerInfo.bookingCode", "");
                      }
                    }}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Chọn kênh đặt phòng" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {BOOKING_CHANNEL.map((channel) => (
                        <SelectItem key={channel} value={channel}>
                          {channel}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {bookingChannel && bookingChannel !== "Direct" && (
              <FormField
                control={form.control}
                name="customerInfo.bookingCode"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Mã Đặt Phòng</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="ABC123"
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

          {/* Check-in / Check-out */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="customerInfo.checkIn"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Ngày Nhận Phòng</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value
                            ? format(field.value, "PPP")
                            : "Chọn ngày"}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        locale={vi}
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customerInfo.checkOut"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Ngày Trả Phòng</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value
                            ? format(field.value, "PPP")
                            : "Chọn ngày"}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        locale={vi}
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </Form>
    </ScrollArea>
  );
}

export default CustomerInfoForm;
