import { useStep } from "~/hooks/use-step";
import type { Route } from "./+types/new-booking";
import { CustomerInfoForm } from "./components/forms/customer-info-form";
import { RoomPickerForm } from "./components/forms/room-picker-form";
import { ReviewPaymentForm } from "./components/forms/review-payment-form";
import Steps from "./components/new-booking-stepper";
import { Card } from "~/components/ui/card";
import { useCreateBookingStore } from "~/store/create-booking.store";

export const action = async ({ request, params }: Route.ActionArgs) => {
  return {};
};

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  return {};
};

export default function Component({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const [currentStep, { goToNextStep, reset, goToPrevStep, setStep }] =
    useStep(3);

  const steps = [
    {
      step: 1,
      title: "Bước 1",
      description: "Thông tin khách hàng",
    },
    {
      step: 2,
      title: "Bước 2",
      description: "Thông tin đặt phòng",
    },
    {
      step: 3,
      title: "Bước 3",
      description: "Xác nhận và thanh toán",
    },
  ];
  return (
    <main className="mx-auto max-w-5xl space-y-10 py-10">
      <Card className="p-6 shadow-s">
        <Steps
          steps={steps}
          currentStep={currentStep}
          goToNextStep={goToNextStep}
          goToPrevStep={goToPrevStep}
        />
      </Card>
      {currentStep === 1 && <CustomerInfoForm onNext={goToNextStep} />}
      {currentStep === 2 && (
        <RoomPickerForm onNext={goToNextStep} onCancel={goToPrevStep} />
      )}
      {currentStep === 3 && (
        <ReviewPaymentForm onNext={goToNextStep} onBack={goToPrevStep} />
      )}
    </main>
  );
}
