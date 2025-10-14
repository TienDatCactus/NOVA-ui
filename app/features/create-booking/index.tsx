import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import ProgressSteps from "~/components/ui/progress-step";
import { cn } from "~/lib/utils";
import { useCreateBookingStore } from "~/store/create-booking.store";
import BookingConfirmation from "./components/booking-confirmation";
import CustomerInfoForm from "./components/customer-info-form";
import RoomSelectionForm from "./components/room-selection-form";
import useBookingSchema from "~/schema/booking.schema";
import { useForm } from "react-hook-form";
import { Button } from "~/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import type z from "zod";
import { toast } from "sonner";

interface CreateBookingDialogProps {
  close?: () => void;
  open?: boolean;
}

export default function CreateBookingDialog({
  close,
  open = false,
  ...props
}: CreateBookingDialogProps) {
  const steps = ["Thông tin khách hàng", "Chọn phòng", "Xác nhận đặt phòng"];
  const { currentStep, nextStep, prevStep, updateFormData, formData, reset } =
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
  const StepComponents = [
    <CustomerInfoForm form={form} />,
    <RoomSelectionForm form={form} />,
    <BookingConfirmation form={form} />,
  ];
  const dialogWidthClass = {
    1: "max-w-3xl",
    2: "max-w-5xl",
    3: "max-w-7xl",
  }[currentStep];
  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent
        className={cn(
          "w-full max-h-[90vh] mx-2 flex flex-col",
          dialogWidthClass
        )}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-4">
            {steps[currentStep - 1]}
          </DialogTitle>
          <ProgressSteps
            controlled={true}
            totalSteps={steps.length}
            steps={steps}
            currentStep={currentStep}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        </DialogHeader>
        {StepComponents[currentStep - 1]}
        <DialogFooter>
          <div className="flex w-full justify-between">
            {currentStep > 1 ? (
              <Button variant="outline" onClick={prevStep}>
                Quay lại
              </Button>
            ) : (
              <div />
            )}
            <div className="flex gap-2">
              <Button
                variant="destructive"
                onClick={() => {
                  reset();
                  form.reset();
                }}
              >
                Xóa
              </Button>
              <Button
                onClick={handleNext}
                disabled={form.formState.isSubmitting}
              >
                {currentStep === steps.length ? "Hoàn tất" : "Tiếp theo"}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
