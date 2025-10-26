import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { differenceInDays, startOfDay, addDays } from "date-fns";
import { toast } from "sonner";
import { Loader2, CheckCircle2, Users, Calendar } from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

import { useCreateBookingStore } from "~/store/create-booking.store";
import useBookingSchema from "~/services/schema/booking.schema";
import type z from "zod";
import { DatePicker } from "~/components/ui/date-picker";
import { cn } from "~/lib/utils";
import { Counter } from "~/components/ui/shadcn-io/button-group/advanced/Counter";
import useFormSchema from "~/services/schema/forms.schema";
import type { CustomerInfoFormData } from "~/services/types/forms.types";

export const BOOKING_SOURCES = [
  { value: 0, label: "Trực tiếp (Nhân viên)", key: "DirectStaff" },
  { value: 1, label: "Trực tiếp (Khách hàng)", key: "DirectCustomer" },
  { value: 2, label: "OTA", key: "OTA" },
  { value: 3, label: "Đại lý", key: "Agency" },
] as const;

export const MOCK_OTA_LIST = [
  { id: "550e8400-e29b-41d4-a716-446655440000", name: "Booking.com" },
  { id: "550e8400-e29b-41d4-a716-446655440001", name: "Agoda" },
  { id: "550e8400-e29b-41d4-a716-446655440002", name: "Expedia" },
  { id: "550e8400-e29b-41d4-a716-446655440003", name: "Airbnb" },
  { id: "550e8400-e29b-41d4-a716-446655440004", name: "Traveloka" },
] as const;

export async function mockCheckAvailability(params: {
  checkinDate: Date;
  checkoutDate: Date;
  adultsAmount: number;
  childrenAmount: number;
}): Promise<{ available: boolean; summary: string; count: number }> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  const nights = Math.ceil(
    (params.checkoutDate.getTime() - params.checkinDate.getTime()) /
      (1000 * 60 * 60 * 24)
  );
  const mockCount = Math.floor(Math.random() * 10) + 3;

  return {
    available: mockCount > 0,
    count: mockCount,
    summary: `Có ${mockCount} phòng trống cho ${nights} đêm (${params.adultsAmount} người lớn${params.childrenAmount > 0 ? `, ${params.childrenAmount} trẻ em` : ""})`,
  };
}
const { StaffCreateBookingSchema } = useBookingSchema();

interface CustomerInfoFormProps {
  onNext: () => void;
  onCancel?: () => void;
}

export function CustomerInfoForm({ onNext, onCancel }: CustomerInfoFormProps) {
  const { data: storeData, setData, setStep } = useCreateBookingStore();
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const { CustomerInfoFormSchema } = useFormSchema();
  const form = useForm({
    resolver: zodResolver(CustomerInfoFormSchema),
    defaultValues: {
      guestFullName: storeData.guestFullName || "",
      guestPhone: storeData.guestPhone || "",
      guestEmail: storeData.guestEmail || "",
      checkinDate: storeData.checkinDate,
      checkoutDate: storeData.checkoutDate,
      adultsAmount: storeData.adultsAmount || 1,
      childrenAmount: storeData.childrenAmount || 0,
      source: storeData.source,
      otaInformationId: storeData.otaInformationId,
    },
  });

  const nights = useMemo(() => {
    if (form.watch("checkinDate") && form.watch("checkoutDate")) {
      return differenceInDays(
        form.watch("checkoutDate"),
        form.watch("checkinDate")
      );
    }
    return 0;
  }, [form.watch("checkinDate"), form.watch("checkoutDate")]);

  useEffect(() => {
    const subscription = form.watch((values) => {
      const timeout = setTimeout(() => {
        setData(values as Partial<z.infer<typeof StaffCreateBookingSchema>>);
      }, 500);

      return () => clearTimeout(timeout);
    });

    return () => subscription.unsubscribe();
  }, [form, setData]);

  const handleCheckAvailability = async () => {
    const checkinDate = form.getValues("checkinDate");
    const checkoutDate = form.getValues("checkoutDate");
    const adultsAmount = form.getValues("adultsAmount");
    const childrenAmount = form.getValues("childrenAmount");

    if (!checkinDate || !checkoutDate) {
      toast.error("Vui lòng chọn ngày nhận và trả phòng");
      return;
    }

    if (checkoutDate <= checkinDate) {
      toast.error("Ngày trả phòng phải sau ngày nhận phòng");
      return;
    }

    setIsCheckingAvailability(true);

    try {
      const result = await mockCheckAvailability({
        checkinDate,
        checkoutDate,
        adultsAmount: adultsAmount || 1,
        childrenAmount: childrenAmount || 0,
      });

      if (result.available) {
        toast.success(result.summary, {
          icon: <CheckCircle2 className="h-4 w-4" />,
        });
      } else {
        toast.warning("Không có phòng trống cho thời gian này");
      }
    } catch (error) {
      console.error("Availability check failed:", error);
      toast.error("Không thể kiểm tra phòng trống. Vui lòng thử lại.");
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  const onSubmit = async (values: CustomerInfoFormData) => {
    try {
      setData(values);
      setStep(2);
      onNext();
      toast.success("Đã lưu thông tin khách hàng");
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Có lỗi xảy ra. Vui lòng thử lại.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Thông tin khách hàng & Lưu trú</h2>
          <p className="text-muted-foreground mt-1">
            Bước 1/4 - Nhập thông tin liên hệ và thời gian lưu trú
          </p>
        </div>
        <Badge variant="default">Bước 1</Badge>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 ">
          <div className="grid md:grid-cols-3 grid-cols-1 gap-4">
            <FormField
              control={form.control}
              name="guestFullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Họ và tên <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="bg-background"
                      placeholder="Nhập họ và tên khách hàng"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="guestPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Số điện thoại
                    <span className="text-muted-foreground">(tùy chọn)</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      className="bg-background"
                      placeholder="+84 123 456 789"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="guestEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Email{" "}
                    <span className="text-muted-foreground">(tùy chọn)</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="bg-background"
                      type="email"
                      placeholder="email@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
            <FormField
              control={form.control}
              name="checkinDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Ngày nhận phòng <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <DatePicker
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Chọn ngày nhận phòng"
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
                <FormItem>
                  <FormLabel>
                    Ngày trả phòng <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <DatePicker
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Chọn ngày trả phòng"
                      fromDate={
                        form.watch("checkinDate")
                          ? addDays(form.watch("checkinDate"), 1)
                          : startOfDay(new Date())
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className={cn("grid grid-cols-1 gap-4 md:grid-cols-3")}>
            <FormField
              control={form.control}
              name="adultsAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Số người lớn <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Counter
                      minValue={0}
                      maxValue={10}
                      value={field.value}
                      onChange={field.onChange}
                      isDisabled={form.formState.isSubmitting}
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
                <FormItem>
                  <FormLabel>
                    Số trẻ em{" "}
                    <span className="text-muted-foreground">
                      ( &lt; 6 tuổi)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Counter
                      minValue={0}
                      maxValue={10}
                      value={field.value}
                      onChange={field.onChange}
                      isDisabled={form.formState.isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="source"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kênh đặt phòng</FormLabel>
                  <Select
                    onValueChange={(value) =>
                      field.onChange(Number.parseInt(value))
                    }
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full border-primary bg-primary/10 text-primary shadow-none focus-visible:border-primary focus-visible:ring-primary/20 dark:bg-sky-400/10 dark:text-sky-400 dark:hover:bg-sky-400/10 dark:focus-visible:ring-sky-400/40 [&_svg]:!text-primary dark:[&_svg]:!text-sky-400">
                        <SelectValue placeholder="Chọn kênh đặt phòng" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {BOOKING_SOURCES.map((source) => (
                        <SelectItem
                          className="[&_div:focus]:bg-primary/20 [&_div:focus]:text-primary dark:[&_div:focus]:bg-sky-400/20 dark:[&_div:focus]:text-sky-400"
                          key={source.value}
                          value={source.value.toString()}
                        >
                          {source.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className={cn("grid md:grid-cols-2 grid-cols-1 gap-4")}>
            {form.watch("source") === 2 && (
              <>
                <FormField
                  control={form.control}
                  name="otaInformationId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chọn OTA</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full border-primary bg-primary/10 text-primary shadow-none focus-visible:border-primary focus-visible:ring-primary/20 dark:bg-sky-400/10 dark:text-sky-400 dark:hover:bg-sky-400/10 dark:focus-visible:ring-sky-400/40 [&_svg]:!text-primary dark:[&_svg]:!text-sky-400">
                            <SelectValue placeholder="Chọn nền tảng OTA" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {MOCK_OTA_LIST.map((ota) => (
                            <SelectItem
                              className="[&_div:focus]:bg-primary/20 [&_div:focus]:text-primary dark:[&_div:focus]:bg-sky-400/20 dark:[&_div:focus]:text-sky-400"
                              key={ota.id}
                              value={ota.id}
                            >
                              {ota.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Chọn nền tảng OTA nếu đặt phòng qua trung gian
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* <FormField
                  control={form.control}
                  name=""
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chọn OTA</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full border-primary bg-primary/10 text-primary shadow-none focus-visible:border-primary focus-visible:ring-primary/20 dark:bg-sky-400/10 dark:text-sky-400 dark:hover:bg-sky-400/10 dark:focus-visible:ring-sky-400/40 [&_svg]:!text-primary dark:[&_svg]:!text-sky-400">
                            <SelectValue placeholder="Chọn nền tảng OTA" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {MOCK_OTA_LIST.map((ota) => (
                            <SelectItem
                              className="[&_div:focus]:bg-primary/20 [&_div:focus]:text-primary dark:[&_div:focus]:bg-sky-400/20 dark:[&_div:focus]:text-sky-400"
                              key={ota.id}
                              value={ota.id}
                            >
                              {ota.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Chọn nền tảng OTA nếu đặt phòng qua trung gian
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                /> */}
              </>
            )}
          </div>
          {nights > 0 && (
            <div className=" bg-muted rounded-lg">
              <p className="text-sm font-medium">
                Số đêm: <span className="text-primary">{nights} đêm</span>
              </p>
            </div>
          )}
          <div className="flex items-center justify-between pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleCheckAvailability}
              disabled={
                isCheckingAvailability ||
                !form.watch("checkinDate") ||
                !form.watch("checkoutDate")
              }
            >
              {isCheckingAvailability && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Kiểm tra phòng trống
            </Button>

            <div className="flex gap-2">
              {onCancel && (
                <Button type="button" variant="ghost" onClick={onCancel}>
                  Hủy
                </Button>
              )}
              <Button type="submit">Tiếp theo</Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
