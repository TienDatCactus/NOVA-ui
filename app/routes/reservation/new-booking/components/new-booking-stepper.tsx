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
}

export default function NewBookingSteps({ steps }: NewBookingStepsProps) {
  return (
    <div className="space-y-8 text-center">
      <Stepper defaultValue={2}>
        {steps.map(({ step, title, description }) => (
          <StepperItem
            key={step}
            step={step}
            className="not-last:flex-1 max-md:items-start"
          >
            <StepperTrigger className="rounded max-md:flex-col">
              <StepperIndicator />
              <div className="text-center md:text-left">
                <StepperTitle>{title}</StepperTitle>
                <StepperDescription className="max-sm:hidden">
                  {description}
                </StepperDescription>
              </div>
            </StepperTrigger>
            {step < steps.length && (
              <StepperSeparator className="max-md:mt-3.5 md:mx-4" />
            )}
          </StepperItem>
        ))}
      </Stepper>
    </div>
  );
}
