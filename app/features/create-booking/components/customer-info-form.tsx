import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { vi } from "react-day-picker/locale";
import type { UseFormReturn } from "react-hook-form";
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
import { useCreateBookingStore } from "~/store/create-booking.store";

function CustomerInfoForm({ form }: { form: UseFormReturn<any> }) {
  const { formData } = useCreateBookingStore();
  const [contact, setContact] = useState<"email" | "phoneNumber" | "none">(
    () => {
      const initialEmail = formData.customerInfo?.email;
      const initialPhone = formData.customerInfo?.phoneNumber;

      if (initialEmail) {
        return "email";
      }
      if (initialPhone) {
        return "phoneNumber";
      }
      return "none";
    }
  );
  return (
    <ScrollArea className="h-90 min-h-0">
      <Form {...form}>
        <div className="space-y-6 w-full max-w-[98%] mx-auto">
          <div className="grid grid-cols-1 gap-2">
            <FormField
              control={form.control}
              name="fullName"
              defaultValue={formData.customerInfo?.fullName}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Họ và Tên</FormLabel>
                  <FormControl>
                    <Input className="" placeholder="Nguyễn Văn A" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div
            className={cn("grid grid-cols-1 gap-2", {
              "grid-cols-3":
                contact !== "none" || form.getValues(contact) !== undefined,
            })}
          >
            <FormItem>
              <FormLabel>Phương thức liên lạc</FormLabel>
              <Select
                defaultValue={
                  form.getValues("phoneNumber")
                    ? "phone"
                    : form.getValues("email")
                      ? "email"
                      : contact
                }
                onValueChange={(value) =>
                  setContact(value as "email" | "phoneNumber" | "none")
                }
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
            {(contact !== "none" || form.getValues(contact) !== undefined) && (
              <FormField
                control={form.control}
                name={contact === "phoneNumber" ? "phoneNumber" : "email"}
                defaultValue={
                  contact === "phoneNumber"
                    ? formData.customerInfo?.phoneNumber
                    : formData.customerInfo?.email
                }
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
              "grid-cols-5":
                !!form.watch("bookingChannel") &&
                form.watch("bookingChannel") !== "Direct",
            })}
          >
            <FormField
              control={form.control}
              name="adults"
              defaultValue={formData.customerInfo?.adults || 0}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số lượng người lớn</FormLabel>
                  <FormControl>
                    <Counter
                      number={field.value ? field.value : 0}
                      setNumber={(value) => field.onChange(value)}
                      max={20}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="children"
              defaultValue={formData.customerInfo?.children || 0}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trẻ em ( &lt; 3 tuổi)</FormLabel>
                  <FormControl>
                    <Counter
                      number={field.value ? field.value : 0}
                      setNumber={(value) => field.onChange(value)}
                      max={20}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              defaultValue={formData.customerInfo?.bookingChannel || 0}
              name="bookingChannel"
              render={({ field }) => (
                <FormItem
                  className={cn("col-span-2", {
                    "col-span-1":
                      form.watch("bookingChannel") &&
                      form.watch("bookingChannel") !== "Direct",
                  })}
                >
                  <FormLabel>Kênh Đặt Phòng</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
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
            {!!form.watch("bookingChannel") &&
              form.watch("bookingChannel") !== "Direct" && (
                <FormField
                  control={form.control}
                  defaultValue={formData.customerInfo?.bookingCode || ""}
                  name="bookingCode"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Mã Đặt Phòng</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="ABC123"
                          className="w-full"
                        ></Input>
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              defaultValue={formData.customerInfo?.checkIn}
              name="checkIn"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Ngày Nhận Phòng</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Chọn ngày</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
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
              defaultValue={formData.customerInfo?.checkOut}
              name="checkOut"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Ngày Trả Phòng</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Chọn ngày</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        locale={vi}
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
