import {
  Stepper,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "~/components/ui/stepper";

interface NewBookingStepsProps {
  steps: {
    step: number;
    title: string;
    description: string;
  }[];
  currentStep?: number;
  goToNextStep?: () => void;
  goToPrevStep?: () => void;
}

export default function NewBookingSteps({
  steps,
  currentStep,
  goToNextStep,
  goToPrevStep,
}: NewBookingStepsProps) {
  const handleStepChange = (step: number) => {
    if (step > (currentStep || 0)) {
      goToNextStep && goToNextStep();
    } else {
      goToPrevStep && goToPrevStep();
    }
  };
  return (
    <div className="space-y-8 text-center">
      <Stepper value={currentStep}>
        {steps.map(({ step, title, description }) => (
          <StepperItem
            key={step}
            step={step}
            className="not-last:flex-1 max-md:items-start"
          >
            <StepperTrigger
              onChange={() => handleStepChange(step)}
              className="rounded max-md:flex-col"
            >
              <StepperIndicator />
              <div className="text-center md:text-left">
                <StepperTitle>{title}</StepperTitle>
                <StepperDescription className="max-sm:hidden">
                  {description}
                </StepperDescription>
              </div>
            </StepperTrigger>
            {step < steps.length && (
              <StepperSeparator className="max-md:mt-3.5 md:mx-4 " />
            )}
          </StepperItem>
        ))}
      </Stepper>
    </div>
  );
}
