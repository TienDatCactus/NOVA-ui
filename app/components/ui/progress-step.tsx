import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Progress } from "~/components/ui/progress";
interface ProgressStepsProps {
  steps: string[];
  currentStep: number;
  nextStep: () => void;
  prevStep: () => void;
  totalSteps: number;
  controlled?: boolean;
}
export default function ProgressSteps({
  steps,
  currentStep,
  nextStep,
  prevStep,
  totalSteps,
  controlled = true,
}: ProgressStepsProps) {
  const progress = (currentStep / totalSteps) * 100;
  return (
    <div
      className="flex justify-center self-start pt-6 w-full"
      style={{
        all: "revert",
        display: "flex",
        justifyContent: "center",
        alignSelf: "flex-start",
        paddingTop: "1.5rem",
        width: "100%",
        fontSize: "14px",
        lineHeight: "1.5",
        letterSpacing: "normal",
      }}
    >
      <div className="w-full space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">
              Bước {currentStep} / {totalSteps}
            </span>
            <span className="text-muted-foreground">
              {steps[currentStep - 1]}
            </span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>

        {controlled && (
          <div className="flex justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Previous
            </Button>
            <Button
              size="sm"
              onClick={nextStep}
              disabled={currentStep === totalSteps}
            >
              {currentStep === totalSteps ? "Complete" : "Next"}
              {currentStep !== totalSteps && (
                <ChevronRight className="ml-1 h-4 w-4" />
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
