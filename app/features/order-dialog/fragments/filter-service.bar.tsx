import { RotateCcw } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import type { ServiceTypeListResponseDto } from "~/services/api/service-types/dto";

interface FilterServiceBarProps {
  serviceTypes: ServiceTypeListResponseDto;
  selectedTypeCode: string;
  onTypeChange: (typeCode: string) => void;
  onReset: () => void;
}

/**
 * Filter bar for services
 * Shows service type selection as compact dropdown
 */
export default function FilterServiceBar({
  serviceTypes,
  selectedTypeCode,
  onTypeChange,
  onReset,
}: FilterServiceBarProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Loại dịch vụ</Label>
        <Button variant="ghost" size="sm" onClick={onReset} className="h-8">
          <RotateCcw className="h-3.5 w-3.5" />
          Đặt lại
        </Button>
      </div>

      <Select value={selectedTypeCode} onValueChange={onTypeChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Chọn loại dịch vụ" />
        </SelectTrigger>
        <SelectContent>
          {serviceTypes.map((type) => (
            <SelectItem key={type.id} value={type.code}>
              <div className="flex flex-col">
                <span className="font-medium">{type.name}</span>
                {type.description && (
                  <span className="text-xs text-muted-foreground">
                    {type.description}
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
