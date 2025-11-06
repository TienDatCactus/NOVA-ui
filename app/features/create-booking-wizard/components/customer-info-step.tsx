import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useEffect } from "react";

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
import { cn, onError } from "~/lib/utils";
import { useCreateBookingStore } from "~/store/create-booking.store";
import { BOOKING_SOURCES } from "~/services/api/booking/booking.types";
import type { BookingOTAResponseDto } from "~/services/api/booking/dto";
import { Button } from "~/components/ui/button";
import { useOTAInfo } from "../container/create-booking-query.hooks";

// Step 2 Schema: Customer Info + Detailed Booking Type
const CustomerInfoSchema = z.object({
  guestFullName: z
    .string()
    .min(2, "Tên khách phải có ít nhất 2 ký tự")
    .regex(/^[^\d]+$/, "Tên khách không được chứa số"),
  guestPhone: z.string().optional(),
  guestEmail: z.email("Email không hợp lệ").optional().or(z.literal("")),
  // Conditional fields
  source: z.string().optional(), // For Direct booking
  otaInformationId: z.string().optional(), // For OTA
  otaBookingCode: z.string().optional(), // For OTA
});

type CustomerInfoFormData = z.infer<typeof CustomerInfoSchema>;

interface CustomerInfoStepProps {
  onNext: () => void;
  formRef?: React.RefObject<HTMLFormElement | null>;
}

export function CustomerInfoStep({ onNext, formRef }: CustomerInfoStepProps) {
  const { data: bookingData, setData } = useCreateBookingStore();
  const bookingType = bookingData.bookingType;

  const { data: otaList } = useOTAInfo({
    selection: bookingType === "OTA",
  });

  const form = useForm<CustomerInfoFormData>({
    resolver: zodResolver(CustomerInfoSchema),
    defaultValues: {
      guestFullName: bookingData.guestFullName ?? "",
      guestPhone: bookingData.guestPhone ?? "",
      guestEmail: bookingData.guestEmail ?? "",
      source: bookingData.source ?? undefined,
      otaInformationId: bookingData.otaInformationId ?? undefined,
      otaBookingCode: bookingData.otaBookingCode ?? "",
    },
  });

  useEffect(() => {
    form.reset({
      guestFullName: bookingData.guestFullName ?? "",
      guestPhone: bookingData.guestPhone ?? "",
      guestEmail: bookingData.guestEmail ?? "",
      source: bookingData.source ?? undefined,
      otaInformationId: bookingData.otaInformationId ?? undefined,
      otaBookingCode: bookingData.otaBookingCode ?? "",
    });
  }, [bookingData, form]);

  const onSubmit = async (values: CustomerInfoFormData) => {
    try {
      let sourceValue = values.source;
      if (bookingType === "OTA") {
        sourceValue = "OTA";
      } else if (bookingType === "Direct" && !values.source) {
        sourceValue = "DirectStaff"; // Default for Direct
      }

      setData({
        guestFullName: values.guestFullName,
        guestPhone: values.guestPhone,
        guestEmail: values.guestEmail,
        source: sourceValue as any,
        otaInformationId: values.otaInformationId,
        otaBookingCode: values.otaBookingCode,
      });

      toast.success("Đã lưu thông tin khách hàng");
      onNext();
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Có lỗi xảy ra. Vui lòng thử lại.");
    }
  };

  return (
    <Form {...form}>
      <form
        ref={formRef}
        onSubmit={form.handleSubmit(onSubmit, onError)}
        className="space-y-6"
      >
        {bookingType === "Direct" && (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="source"
              render={() => (
                <FormItem>
                  <FormLabel>Nguồn đặt phòng</FormLabel>
                  <FormControl>
                    <div className="grid md:grid-cols-2 grid-cols-1 gap-2">
                      {BOOKING_SOURCES.filter((s) => s.key !== "OTA").map(
                        (source) => (
                          <Button
                            type="button"
                            variant="ghost"
                            key={source.key}
                            onClick={() => form.setValue("source", source.key)}
                            className={cn(
                              "rounded-lg border-2 h-12 p-4 text-center transition-all",
                              form.getValues("source") === source.key
                                ? "border-primary bg-primary/10"
                                : ""
                            )}
                          >
                            {source.label}
                          </Button>
                        )
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>
                    Chọn nguồn đặt phòng trực tiếp (Nhân viên, Đại lý, v.v.)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {bookingType === "OTA" && (
          <div className="grid grid-cols-1  gap-4">
            <FormField
              control={form.control}
              name="otaInformationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Nền tảng OTA <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="flex flex-wrap gap-2">
                      {otaList?.map((ota) => (
                        <Button
                          type="button"
                          variant="ghost"
                          key={ota.id}
                          onClick={() =>
                            form.setValue("otaInformationId", ota.id)
                          }
                          className={cn(
                            "rounded-lg border-2 h-12 p-4 text-center transition-all",
                            form.getValues("otaInformationId") === ota.id
                              ? "border-primary bg-primary/10"
                              : ""
                          )}
                        >
                          {ota.name}
                        </Button>
                      ))}
                    </div>
                  </FormControl>

                  <FormDescription>
                    Booking.com, Agoda, Expedia, v.v.
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
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Nhập mã đặt phòng từ OTA"
                      className="bg-secondary"
                    />
                  </FormControl>
                  <FormDescription>Mã booking từ nền tảng OTA</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    placeholder="Nguyễn Văn A"
                    className="bg-secondary"
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
                  Số điện thoại{" "}
                  <span className="text-muted-foreground text-xs">
                    (tùy chọn)
                  </span>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="tel"
                    placeholder="+84 123 456 789"
                    className="bg-secondary"
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
                  <span className="text-muted-foreground text-xs">
                    (tùy chọn)
                  </span>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="email@example.com"
                    className="bg-secondary"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Conditional Fields based on Booking Type */}
      </form>
    </Form>
  );
}
