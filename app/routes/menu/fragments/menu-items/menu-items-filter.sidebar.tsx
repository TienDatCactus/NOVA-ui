import { Search, Filter } from "lucide-react";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Separator } from "~/components/ui/separator";
import type { MenuCategoryWithItems } from "~/services/api/menu-item/dto";

interface MenuItemsFilterSidebarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  categories: MenuCategoryWithItems[];
  selectedCategories: string[];
  onCategoryToggle: (categoryCode: string) => void;
  onSelectAll: () => void;
  onClearFilters: () => void;
  showInactive: boolean;
  onToggleInactive: (checked: boolean) => void;
}

export default function MenuItemsFilterSidebar({
  searchQuery,
  setSearchQuery,
  categories,
  selectedCategories,
  onCategoryToggle,
  onSelectAll,
  onClearFilters,
  showInactive,
  onToggleInactive,
}: MenuItemsFilterSidebarProps) {
  const allSelected =
    categories.length > 0 && selectedCategories.length === categories.length;

  return (
    <div className="flex flex-col gap-6 p-6 border-r bg-card h-full">
      {/* Search */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Tìm kiếm</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Theo mã, tên hàng"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Separator />

      {/* Category Filter */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Danh mục thực đơn
          </Label>
          {selectedCategories.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="h-auto p-0 text-xs"
            >
              Xóa bộ lọc
            </Button>
          )}
        </div>

        <div className="space-y-3">
          {/* Select All */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="all-categories"
              checked={allSelected}
              onCheckedChange={onSelectAll}
            />
            <label
              htmlFor="all-categories"
              className="text-sm font-medium cursor-pointer"
            >
              Tất cả
            </label>
          </div>

          {/* Category List */}
          {categories.map((category) => {
            const isSelected = selectedCategories.includes(category.categoryCode);
            const itemCount = category.items.length;

            return (
              <div key={category.categoryId} className="flex items-center space-x-2">
                <Checkbox
                  id={category.categoryCode}
                  checked={isSelected}
                  onCheckedChange={() => onCategoryToggle(category.categoryCode)}
                />
                <label
                  htmlFor={category.categoryCode}
                  className="text-sm cursor-pointer flex-1"
                >
                  {category.categoryName}
                  <span className="text-xs text-muted-foreground ml-1">
                    ({itemCount})
                  </span>
                </label>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
