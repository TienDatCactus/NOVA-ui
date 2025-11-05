import { RotateCcw } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import type { MenuCategoryListResponseDto } from "~/services/api/menu-category/dto";

interface FilterMenuBarProps {
  menuCategories: MenuCategoryListResponseDto;
  selectedCategoryCode: string;
  onCategoryChange: (categoryCode: string) => void;
  onReset: () => void;
}

/**
 * Filter bar for menu items
 * Shows menu category selection as radio buttons
 */
export default function FilterMenuBar({
  menuCategories,
  selectedCategoryCode,
  onCategoryChange,
  onReset,
}: FilterMenuBarProps) {
  return (
    <div className="space-y-4">
      {/* Reset Button */}
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={onReset}>
          <RotateCcw className="h-4 w-4" />
          Đặt lại
        </Button>
      </div>

      {/* Menu Category Radio Group */}
      <RadioGroup
        className="w-full max-w-96 justify-items-center grid-cols-1 gap-3"
        value={selectedCategoryCode}
        onValueChange={onCategoryChange}
      >
        {menuCategories.map((category) => (
          <div
            key={category.id}
            className="border-input shadow-none has-data-[state=checked]:shadow-sm has-data-[state=checked]:border-primary/50 relative flex w-full items-center gap-3 rounded-md border p-2 cursor-pointer outline-none"
          >
            <RadioGroupItem
              value={category.code}
              id={category.id}
              className="order-1 size-5 after:absolute after:inset-0 [&_svg]:size-3"
              aria-describedby={`${category.id}-description`}
            />
            <div className="grid grow gap-2">
              <Label htmlFor={category.id} className="text-start line-clamp-1">
                {category.name}
              </Label>
              <p
                id={`${category.id}-description`}
                className="text-muted-foreground text-start text-xs line-clamp-2"
              >
                {category.code}
              </p>
            </div>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
