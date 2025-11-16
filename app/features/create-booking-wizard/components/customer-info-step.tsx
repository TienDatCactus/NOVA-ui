import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { cn, onError } from "~/lib/utils";
import { BookingSchema } from "~/services/api/booking/booking.schema";
import { BOOKING_SOURCES } from "~/services/api/booking/booking.types";
import { useCreateBookingStore } from "~/store/create-booking.store";
import { useOTAInfo } from "../container/create-booking-query.hooks";
import { Counter } from "~/components/ui/shadcn-io/button-group/advanced/counter";
const { StaffCreateBookingSchema } = BookingSchema;

// Step 2 Schema: Customer Info + Detailed Booking Type
const CustomerInfoSchema = z
  .object({
    guestFullName: StaffCreateBookingSchema.shape.guestFullName,
    guestPhone: StaffCreateBookingSchema.shape.guestPhone,
    guestEmail: StaffCreateBookingSchema.shape.guestEmail,
    source: StaffCreateBookingSchema.shape.source,
    otaInformationId: StaffCreateBookingSchema.shape.otaInformationId,
    otaBookingCode: StaffCreateBookingSchema.shape.otaBookingCode,
    adultsAmount: StaffCreateBookingSchema.shape.adultsAmount,
    childrenAmount: StaffCreateBookingSchema.shape.childrenAmount,
  })
  .superRefine((data, ctx) => {
    if (data.source === "OTA" || data.otaInformationId) {
      if (!data.otaInformationId) {
        ctx.addIssue({
          code: "custom",
          message: "Vui lòng chọn nền tảng OTA",
          path: ["otaInformationId"],
        });
      }
      if (!data.otaBookingCode) {
        ctx.addIssue({
          code: "custom",
          message: "Mã đặt phòng OTA là bắt buộc",
          path: ["otaBookingCode"],
        });
      }
    }

    if (data.source === "RoomBlock") {
      if (!data.guestFullName || data.guestFullName.trim().length < 2) {
        ctx.addIssue({
          code: "custom",
          message: "Vui lòng nhập lý do khóa phòng",
          path: ["guestFullName"],
        });
      }
      return;
    }

    if (data.source === "DirectStaff" || data.source === "Agency") {
      if (!data.guestPhone && !data.guestEmail) {
        ctx.addIssue({
          code: "custom",
          message: "Vui lòng nhập ít nhất số điện thoại hoặc email",
          path: ["guestPhone"],
        });
      }
    }
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

  const form = useForm({
    resolver: zodResolver(CustomerInfoSchema),
    defaultValues: {
      guestFullName: bookingData.guestFullName ?? "",
      guestPhone: bookingData.guestPhone ?? "",
      guestEmail: bookingData.guestEmail ?? "",
      source: bookingData.source ?? undefined,
      otaInformationId: bookingData.otaInformationId ?? undefined,
      otaBookingCode: bookingData.otaBookingCode ?? "",
      adultsAmount: bookingData.adultsAmount ?? 1,
      childrenAmount: bookingData.childrenAmount ?? 0,
    },
    reValidateMode: "onChange",
    mode: "onChange",
  });

  useEffect(() => {
    form.reset({
      guestFullName: bookingData.guestFullName ?? "",
      guestPhone: bookingData.guestPhone ?? "",
      guestEmail: bookingData.guestEmail ?? "",
      source: bookingData.source,
      otaInformationId: bookingData.otaInformationId ?? undefined,
      otaBookingCode: bookingData.otaBookingCode ?? "",
      adultsAmount: bookingData.adultsAmount ?? 1,
      childrenAmount: bookingData.childrenAmount ?? 0,
    });
  }, [bookingData, form]);

  const onSubmit = async (values: CustomerInfoFormData) => {
    try {
      let sourceValue = values.source;

      // Set source based on bookingType
      if (bookingType === "RoomBlock") {
        sourceValue = "RoomBlock";
      } else if (bookingType === "OTA") {
        sourceValue = "OTA";
      } else if (bookingType === "Direct" && !values.source) {
        sourceValue = "DirectStaff";
      }

      setData({
        guestFullName: values.guestFullName,
        guestPhone: bookingType === "RoomBlock" ? "" : values.guestPhone || "",
        guestEmail: bookingType === "RoomBlock" ? "" : values.guestEmail || "",
        source: sourceValue as any,
        otaInformationId:
          bookingType === "OTA" ? values.otaInformationId : undefined,
        otaBookingCode: bookingType === "OTA" ? values.otaBookingCode : "",
        adultsAmount: values.adultsAmount,
        childrenAmount: values.childrenAmount,
      });

      toast.success(
        bookingType === "RoomBlock"
          ? "Đã lưu lý do khóa phòng"
          : "Đã lưu thông tin khách hàng"
      );
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
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nguồn đặt phòng</FormLabel>
                  <FormControl>
                    <div className="grid md:grid-cols-2 grid-cols-1 gap-2">
                      {BOOKING_SOURCES.filter(
                        (s) => s.key !== "OTA" && s.key !== "RoomBlock"
                      ).map((source) => (
                        <Button
                          type="button"
                          variant="ghost"
                          key={source.key}
                          onClick={() => field.onChange(source.key)}
                          className={cn(
                            "rounded-lg border-2 h-12 p-4 text-center transition-all",
                            field.value === source.key
                              ? "border-primary bg-primary/10"
                              : ""
                          )}
                        >
                          {source.label}
                        </Button>
                      ))}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="otaInformationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Nền tảng OTA <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="w-full justify-between bg-secondary"
                        >
                          {field.value
                            ? otaList?.find((ota) => ota.id === field.value)
                                ?.name
                            : "Chọn nền tảng OTA"}
                        </Button>
                      </PopoverTrigger>

                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Tìm kiếm nền tảng..." />
                          <CommandList>
                            <CommandEmpty>Không có kết quả nào.</CommandEmpty>
                            <CommandGroup>
                              {otaList?.map((ota) => (
                                <CommandItem
                                  key={ota.id}
                                  onSelect={() => {
                                    field.onChange(ota.id);
                                  }}
                                >
                                  {ota.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
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
                  <FormLabel>
                    Mã đặt phòng OTA <span className="text-destructive">*</span>
                  </FormLabel>
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
                  {bookingType === "RoomBlock"
                    ? "Lý do khóa phòng"
                    : "Họ và tên"}{" "}
                  <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={
                      bookingType === "RoomBlock"
                        ? "VD: Bảo trì hệ thống điện"
                        : "Nguyễn Văn A"
                    }
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    minValue={1}
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
                  <span className="text-muted-foreground text-xs">
                    (&lt; 6 tuổi)
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
        </div>
        {/* Conditional Fields based on Booking Type */}
      </form>
    </Form>
  );
}
