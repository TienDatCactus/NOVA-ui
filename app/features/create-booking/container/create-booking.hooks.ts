import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type z from "zod";
import useBookingSchema from "~/services/schema/booking.schema";
import { useCreateBookingStore } from "~/store/create-booking.store";

function useCreateBooking({ close }: { close?: () => void }) {
  const steps = ["Thông tin khách hàng", "Chọn phòng", "Xác nhận đặt phòng"];
  const { currentStep, nextStep, updateFormData, formData, reset } =
    useCreateBookingStore();
  const { CustomerBookingInfoSchema, BookingSchema, RoomSelectionSchema } =
    useBookingSchema();
  const form = useForm<z.infer<typeof BookingSchema>>({
    resolver: zodResolver(BookingSchema),
    defaultValues: formData,
  });
  const handleNext = async () => {
    const currentFormData = form.getValues();
    if (currentStep === 1) {
      const result = CustomerBookingInfoSchema.safeParse(
        currentFormData.customerInfo
      );
      console.log(result);
      if (result.success) {
        form.clearErrors("customerInfo");
        updateFormData({ ...formData, customerInfo: result.data });
        nextStep();
      } else {
        result.error.issues.forEach((err) => {
          form.setError(`customerInfo.${err.path.join(".")}` as any, {
            message: err.message,
          });
        });
      }
    } else if (currentStep === 2) {
      const result = RoomSelectionSchema.safeParse(
        currentFormData.roomSelection
      );
      console.log(result);
      if (result.success) {
        form.clearErrors("roomSelection");
        updateFormData({ ...formData, roomSelection: result.data });
        nextStep();
      } else {
        result.error.issues.forEach((err) => {
          form.setError(`roomSelection.${err.path.join(".")}` as any, {
            message: err.message,
          });
        });
      }
    } else if (currentStep === 3) {
      const result = BookingSchema.safeParse({
        ...currentFormData,
        services: formData.services || [],
      });
      console.log(result);
      if (result.success) {
        console.log("Final data to submit:", result.data);
        toast.success("Đặt phòng thành công!");
        form.reset();
        reset();
        close?.();
      } else {
        result.error.issues.forEach((err) => {
          form.setError(err.path.join(".") as any, {
            message: err.message,
          });
        });
      }
    }
  };

  return {
    steps,
    handleNext,
    createBookingForm: form,
  };
}

export default useCreateBooking;
