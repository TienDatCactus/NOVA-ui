import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
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

import { DatePicker } from "~/components/ui/date-picker";
import { Counter } from "~/components/ui/shadcn-io/button-group/advanced/counter";
import { cn, onError, useCalculateNights } from "~/lib/utils";
import { BOOKING_SOURCES } from "~/services/types/booking.types";
import type { CustomerInfoFormData } from "~/services/types/forms.types";
import { useCreateBookingStore } from "~/store/create-booking.store";
import { useOTAInfo } from "../../container/create-booking-query.hooks";
import { useEffect, useState } from "react";
import { Spinner } from "~/components/ui/shadcn-io/spinner";
import { FormSchema } from "~/services/schema/forms.schema";

interface CustomerInfoFormProps {
  onNext: () => void;
}

export function CustomerInfoForm({ onNext }: CustomerInfoFormProps) {
  const { data: storeData, setData, setStep } = useCreateBookingStore();
  const { CustomerInfoFormSchema } = FormSchema;

  const form = useForm({
    resolver: zodResolver(CustomerInfoFormSchema),
    // Provide initial defaults to avoid transient undefined, then keep reset for hydration updates
    defaultValues: {
      guestFullName: storeData.guestFullName ?? "",
      guestPhone: storeData.guestPhone ?? "",
      guestEmail: storeData.guestEmail ?? "",
      checkinDate: storeData.checkinDate
        ? new Date(storeData.checkinDate)
        : undefined,
      checkoutDate: storeData.checkoutDate
        ? new Date(storeData.checkoutDate)
        : undefined,
      adultsAmount: storeData.adultsAmount ?? 0,
      childrenAmount: storeData.childrenAmount ?? 0,
      source: storeData.source,
      otaInformationId: storeData.otaInformationId ?? undefined,
      otaBookingCode: storeData.otaBookingCode ?? "",
    },
  });
  useEffect(() => {
    if (!storeData) return;
    form.reset({
      guestFullName: storeData.guestFullName ?? "",
      guestPhone: storeData.guestPhone ?? "",
      guestEmail: storeData.guestEmail ?? "",
      checkinDate: storeData.checkinDate
        ? new Date(storeData.checkinDate)
        : undefined,
      checkoutDate: storeData.checkoutDate
        ? new Date(storeData.checkoutDate)
        : undefined,
      adultsAmount: storeData.adultsAmount ?? 0,
      childrenAmount: storeData.childrenAmount ?? 0,
      source: storeData.source,
      otaInformationId: storeData.otaInformationId ?? undefined,
      otaBookingCode: storeData.otaBookingCode ?? "",
    });
  }, [storeData]);
  const { data: otaList } = useOTAInfo({
    selection: form.watch("source") === "OTA" ? true : false,
  });
  const nights = useCalculateNights({
    checkinDate: form.watch("checkinDate"),
    checkoutDate: form.watch("checkoutDate"),
  });
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
    <Card className="space-y-6 p-6 shadow-s">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Thông tin khách hàng & Lưu trú</h2>
          <p className="text-muted-foreground mt-1">
            Bước 1/3 - Nhập thông tin liên hệ và thời gian lưu trú
          </p>
        </div>
        <Badge variant="default">Bước 1</Badge>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, onError)}
          className="space-y-6 "
        >
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
                      {...field}
                      className="bg-secondary"
                      placeholder="Nhập họ và tên khách hàng"
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
                      {...field}
                      type="tel"
                      className="bg-secondary"
                      placeholder="+84 123 456 789"
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
                      {...field}
                      className="bg-secondary"
                      type="email"
                      placeholder="email@example.com"
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
                      {...field}
                      value={field.value}
                      disablePast
                      placeholder="Chọn ngày nhận phòng"
                      className="bg-secondary"
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
                      {...field}
                      value={field.value}
                      disablePast
                      placeholder="Chọn ngày trả phòng"
                      className="bg-secondary"
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
                      {...field}
                      minValue={0}
                      maxValue={10}
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
                      {...field}
                      minValue={0}
                      maxValue={10}
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
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>Kênh đặt phòng</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(value) => field.onChange(value)}
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
                            key={source.key}
                            value={source.key}
                          >
                            {source.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          </div>
          <div className={cn("grid md:grid-cols-2 grid-cols-1 gap-4")}>
            {form.watch("source") === "OTA" && (
              <>
                <FormField
                  control={form.control}
                  name="otaInformationId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chọn kênh OTA</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full bg-secondary">
                            <SelectValue placeholder="Chọn nền tảng OTA" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {otaList?.map((ota) => (
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
                <FormField
                  control={form.control}
                  name="otaBookingCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mã đặt phòng OTA</FormLabel>

                      <Input
                        {...field}
                        className="w-full bg-secondary"
                        placeholder="Mã đặt phòng OTA"
                      />
                      <FormDescription>
                        Mã đặt phòng OTA nếu đặt phòng qua trung gian
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </div>
          <div className="flex items-center justify-between mt-4">
            {nights > 0 && (
              <p className="text-sm font-medium">
                Số đêm: <span className="text-primary">{nights} đêm</span>
              </p>
            )}

            <Button type="submit">Tiếp theo</Button>
          </div>
        </form>
      </Form>
    </Card>
  );
}
