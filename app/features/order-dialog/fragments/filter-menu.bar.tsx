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
import type { MenuCategoryListResponseDto } from "~/services/api/menu-category/dto";

interface FilterMenuBarProps {
  menuCategories: MenuCategoryListResponseDto;
  selectedCategoryCode: string;
  onCategoryChange: (categoryCode: string) => void;
  onReset: () => void;
}

/**
 * Filter bar for menu items
 * Shows menu category selection as compact dropdown
 */
export default function FilterMenuBar({
  menuCategories,
  selectedCategoryCode,
  onCategoryChange,
  onReset,
}: FilterMenuBarProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Danh mục</Label>
        <Button variant="ghost" size="sm" onClick={onReset} className="h-8">
          <RotateCcw className="h-3.5 w-3.5" />
          Đặt lại
        </Button>
      </div>

      <Select value={selectedCategoryCode} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Chọn danh mục" />
        </SelectTrigger>
        <SelectContent>
          {menuCategories.map((category) => (
            <SelectItem key={category.id} value={category.code}>
              <div className="flex flex-col">
                <span className="font-medium">{category.name}</span>
                <span className="text-xs text-muted-foreground">
                  {category.code}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
