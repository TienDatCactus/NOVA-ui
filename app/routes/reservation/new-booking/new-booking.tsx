import { useStep } from "~/hooks/use-step";
import type { Route } from "./+types/new-booking";
import { CustomerInfoForm } from "./components/customer-info-form";
import Steps from "./components/new-booking-stepper";

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
  const [currentStep, { goToNextStep, reset }] = useStep(4);
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
    <main className="mx-auto max-w-4xl space-y-10 py-10">
      <Steps steps={steps} />
      {currentStep === 1 && <CustomerInfoForm onNext={goToNextStep} />}
      {/* Steps 2, 3, 4... */}
    </main>
  );
}
