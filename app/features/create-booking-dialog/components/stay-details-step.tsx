import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useEffect } from "react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { DatePicker } from "~/components/ui/date-picker";
import { Counter } from "~/components/ui/shadcn-io/button-group/advanced/counter";
import { onError, useCalculateNights } from "~/lib/utils";
import { useCreateBookingStore } from "~/store/create-booking.store";

// Step 3 Schema: Stay Details
const StayDetailsSchema = z
  .object({
    checkinDate: z.date({ message: "Vui lòng chọn ngày nhận phòng" }),
    checkoutDate: z.date({ message: "Vui lòng chọn ngày trả phòng" }),
    adultsAmount: z.number().int().min(1, "Phải có ít nhất 1 người lớn"),
    childrenAmount: z.number().int().min(0, "Số trẻ em không hợp lệ"),
  })
  .refine((data) => data.checkoutDate > data.checkinDate, {
    message: "Ngày trả phòng phải sau ngày nhận phòng",
    path: ["checkoutDate"],
  });

type StayDetailsFormData = z.infer<typeof StayDetailsSchema>;

interface StayDetailsStepProps {
  onNext: () => void;
  formRef?: React.RefObject<HTMLFormElement | null>;
}

export function StayDetailsStep({ onNext, formRef }: StayDetailsStepProps) {
  const { data: bookingData, setData } = useCreateBookingStore();

  const form = useForm<StayDetailsFormData>({
    resolver: zodResolver(StayDetailsSchema),
    defaultValues: {
      checkinDate: bookingData.checkinDate
        ? new Date(bookingData.checkinDate)
        : undefined,
      checkoutDate: bookingData.checkoutDate
        ? new Date(bookingData.checkoutDate)
        : undefined,
      adultsAmount: bookingData.adultsAmount ?? 1,
      childrenAmount: bookingData.childrenAmount ?? 0,
    },
  });

  // Sync form with store data
  useEffect(() => {
    form.reset({
      checkinDate: bookingData.checkinDate
        ? new Date(bookingData.checkinDate)
        : undefined,
      checkoutDate: bookingData.checkoutDate
        ? new Date(bookingData.checkoutDate)
        : undefined,
      adultsAmount: bookingData.adultsAmount ?? 1,
      childrenAmount: bookingData.childrenAmount ?? 0,
    });
  }, [bookingData, form]);

  // Calculate nights dynamically
  const nights = useCalculateNights({
    checkinDate: form.watch("checkinDate"),
    checkoutDate: form.watch("checkoutDate"),
  });

  const onSubmit = async (values: StayDetailsFormData) => {
    try {
      setData({
        checkinDate: values.checkinDate,
        checkoutDate: values.checkoutDate,
        adultsAmount: values.adultsAmount,
        childrenAmount: values.childrenAmount,
      });

      toast.success("Đã lưu thông tin lưu trú");
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
        {/* Date Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        {/* Guest Count */}
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

        {/* Nights Calculation Display */}
        {nights > 0 && (
          <div className="flex items-center justify-center p-4 bg-primary/10 rounded-lg border border-primary/20">
            <p className="text-sm font-medium">
              Số đêm lưu trú:{" "}
              <span className="text-primary text-lg font-semibold">
                {nights} đêm
              </span>
            </p>
          </div>
        )}
      </form>
    </Form>
  );
}
