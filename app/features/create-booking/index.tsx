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
import RoomSelectionForm from "./components/room-selection";
import useBookingSchema from "~/services/schema/booking.schema";
import { useForm } from "react-hook-form";
import { Button } from "~/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import type z from "zod";
import { toast } from "sonner";
import useCreateBooking from "./container/create-booking.hooks";

interface CreateBookingDialogProps {
  close?: () => void;
  open?: boolean;
}

export default function CreateBookingDialog({
  close,
  open = false,
  ...props
}: CreateBookingDialogProps) {
  const { createBookingForm, handleNext, steps } = useCreateBooking();
  const { currentStep, nextStep, reset, prevStep } = useCreateBookingStore();
  const StepComponents = [
    <CustomerInfoForm form={createBookingForm} />,
    <RoomSelectionForm form={createBookingForm} />,
    <BookingConfirmation form={createBookingForm} />,
  ];
  const dialogWidthClass = {
    1: "max-w-4xl",
    2: "max-w-6xl",
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
                  createBookingForm.reset();
                }}
              >
                Xóa
              </Button>
              <Button
                onClick={handleNext}
                disabled={createBookingForm.formState.isSubmitting}
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
