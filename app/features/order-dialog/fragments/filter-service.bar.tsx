import { Search } from "lucide-react";
import { Input } from "~/components/ui/input";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";
import type { ServiceTypeListResponseDto } from "~/services/api/service-types/dto";

interface FilterServiceBarProps {
  serviceTypes: ServiceTypeListResponseDto;
  selectedTypes: string[];
  onTypeToggle: (typeId: string) => void;
  searchText: string;
  onSearchChange: (value: string) => void;
}

export default function FilterServiceBar({
  serviceTypes,
  selectedTypes,
  onTypeToggle,
  searchText,
  onSearchChange,
}: FilterServiceBarProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-sm mb-3">Loại dịch vụ</h3>
        <div className="space-y-2">
          {serviceTypes?.map((type) => (
            <div key={type.id} className="flex items-center space-x-2">
              <Checkbox
                id={`service-type-${type.id}`}
                checked={selectedTypes.includes(type.id)}
                onCheckedChange={() => onTypeToggle(type.id)}
              />
              <Label
                htmlFor={`service-type-${type.id}`}
                className="text-sm font-normal cursor-pointer"
              >
                {type.name}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
