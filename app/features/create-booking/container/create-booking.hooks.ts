import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type z from "zod";
import useBookingSchema from "~/services/schema/booking.schema";
import useRoomSchema from "~/services/schema/room.schema";
import { useCreateBookingStore } from "~/store/create-booking.store";

function useCreateBooking({ close }: { close?: () => void }) {
  const steps = ["Thông tin khách hàng", "Chọn phòng", "Xác nhận đặt phòng"];
  const { currentStep, nextStep, updateFormData, formData, reset } =
    useCreateBookingStore();
  const { CustomerBookingInfoSchema, BookingSchema } = useBookingSchema();
  const { RoomSelectionSchema } = useRoomSchema();
  const form = useForm<z.infer<typeof BookingSchema>>({
    resolver: zodResolver(BookingSchema),
    defaultValues: formData,
    mode: "onChange", // Thêm dòng này để validate khi giá trị thay đổi
    reValidateMode: "onChange",
  });
  // const handleNext = async () => {
  //   const currentFormData = form.getValues();
  //   if (currentStep === 1) {
  //     const result = CustomerBookingInfoSchema.safeParse(
  //       currentFormData.customerInfo
  //     );
  //     console.log(result);
  //     if (result.success) {
  //       form.clearErrors("customerInfo");
  //       updateFormData({ ...formData, customerInfo: result.data });
  //       nextStep();
  //     } else {
  //       result.error.issues.forEach((err) => {
  //         form.setError(`customerInfo.${err.path.join(".")}` as any, {
  //           message: err.message,
  //         });
  //       });
  //     }
  //   } else if (currentStep === 2) {
  //     const result = RoomSelectionSchema.safeParse(
  //       currentFormData.roomSelection
  //     );
  //     if (result.success) {
  //       form.clearErrors("roomSelection");
  //       updateFormData({ ...formData, roomSelection: result.data });
  //       nextStep();
  //     } else {
  //       result.error.issues.forEach((err) => {
  //         form.setError(`roomSelection.${err.path.join(".")}` as any, {
  //           message: err.message,
  //         });
  //       });
  //     }
  //   } else if (currentStep === 3) {
  //     const result = BookingSchema.safeParse({
  //       ...currentFormData,
  //       services: formData.services || [],
  //     });
  //     console.log(result);
  //     if (result.success) {
  //       console.log("Final data to submit:", result.data);
  //       form.reset();
  //       reset();
  //       close?.();
  //     } else {
  //       result.error.issues.forEach((err) => {
  //         form.setError(err.path.join(".") as any, {
  //           message: err.message,
  //         });
  //       });
  //     }
  //   }
  // };

  const handleNext = async () => {
    if (currentStep === 1) {
      const customerInfoValid = await form.trigger("customerInfo");
      if (customerInfoValid) {
        updateFormData({
          ...formData,
          customerInfo: form.getValues().customerInfo,
        });
        nextStep();
      }
    } else if (currentStep === 2) {
      const roomSelectionValid = await form.trigger("roomSelection");
      if (roomSelectionValid) {
        updateFormData({
          ...formData,
          roomSelection: form.getValues().roomSelection,
        });
        nextStep();
      }
    } else if (currentStep === 3) {
      const valid = await form.trigger();
      if (valid) {
        console.log("Final data to submit:", form.getValues());
        form.reset();
        reset();
        close?.();
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
