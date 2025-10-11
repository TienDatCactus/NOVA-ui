import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import ProgressSteps from "~/components/ui/progress-step";
import { cn } from "~/lib/utils";
import { useCreateBookingStore } from "~/store/create-booking.store";
import BookingConfirmation from "./components/booking-confirmation";
import CustomerInfoForm from "./components/customer-infor-form";
import RoomSelectionForm from "./components/room-selection-form";

interface CreateBookingDialogProps {
  close?: () => void;
  open?: boolean;
}

const StepComponents = [
  <CustomerInfoForm />,
  <RoomSelectionForm />,
  <BookingConfirmation />,
];

export default function CreateBookingDialog({
  close,
  open = false,
  ...props
}: CreateBookingDialogProps) {
  const steps = ["Thông tin khách hàng", "Chọn phòng", "Xác nhận đặt phòng"];
  const { currentStep, nextStep, prevStep } = useCreateBookingStore();
  const dialogWidthClass = {
    1: "max-w-3xl",
    2: "max-w-5xl",
    3: "max-w-7xl",
  }[currentStep];
  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent
        className={cn("w-full max-h-[90vh] flex flex-col", dialogWidthClass)}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-4">
            {steps[currentStep - 1]}
          </DialogTitle>
          <DialogDescription>
            <ProgressSteps
              controlled={true}
              totalSteps={steps.length}
              steps={steps}
              currentStep={currentStep}
              nextStep={nextStep}
              prevStep={prevStep}
            />
          </DialogDescription>
        </DialogHeader>
        {StepComponents[currentStep - 1]}
      </DialogContent>
    </Dialog>
  );
}
