import { RotateCcw } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import type { ServiceTypeListResponseDto } from "~/services/api/service-types/dto";

interface FilterServiceBarProps {
  serviceTypes: ServiceTypeListResponseDto;
  selectedTypeCode: string;
  onTypeChange: (typeCode: string) => void;
  onReset: () => void;
}

/**
 * Filter bar for services
 * Shows service type selection as radio buttons
 */
export default function FilterServiceBar({
  serviceTypes,
  selectedTypeCode,
  onTypeChange,
  onReset,
}: FilterServiceBarProps) {
  return (
    <div className="space-y-4">
      {/* Reset Button */}
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={onReset}>
          <RotateCcw className="h-4 w-4" />
          Đặt lại
        </Button>
      </div>

      {/* Service Type Radio Group */}
      <RadioGroup
        className="w-full max-w-96 justify-items-center grid-cols-1 gap-3"
        value={selectedTypeCode}
        onValueChange={onTypeChange}
      >
        {serviceTypes.map((type) => (
          <div
            key={type.id}
            className="border-input shadow-none has-data-[state=checked]:shadow-s has-data-[state=checked]:border-primary/50 relative flex w-full items-center gap-3 rounded-md border p-2 cursor-pointer outline-none"
          >
            <RadioGroupItem
              value={type.code}
              id={type.id}
              className="order-1 size-5 after:absolute after:inset-0 [&_svg]:size-3"
              aria-describedby={`${type.id}-description`}
            />
            <div className="grid grow gap-2">
              <Label htmlFor={type.id} className="text-start line-clamp-1">
                {type.name}
              </Label>
              <p
                id={`${type.id}-description`}
                className="text-muted-foreground text-start text-xs line-clamp-2"
              >
                {type.description}
              </p>
            </div>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
