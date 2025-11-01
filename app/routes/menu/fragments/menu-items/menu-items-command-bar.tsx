import { Download, Plus, RotateCcw, Search } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import type { MenuCategoryWithItems } from "~/services/api/menu-item/dto";
import type { MenuItemFilters } from "../../container/use-menu-item-filter.hooks";

interface MenuItemsCommandBarProps {
  filters: MenuItemFilters;
  onFilterChange: <K extends keyof MenuItemFilters>(
    key: K,
    value: MenuItemFilters[K]
  ) => void;
  selectedCount: number;
  onAddItem: () => void;
  onExportExcel: () => void;
  onClearSelection: () => void;
  onResetFilters: () => void;
  categories: MenuCategoryWithItems[];
}

export default function MenuItemsCommandBar({
  filters,
  onFilterChange,
  selectedCount,
  onAddItem,
  onExportExcel,
  onClearSelection,
  onResetFilters,
  categories,
}: MenuItemsCommandBarProps) {
  const activeFiltersCount =
    (filters.searchText !== "" ? 1 : 0) +
    (filters.activeFilter !== "all" ? 1 : 0) +
    (filters.categoryCode !== "" ? 1 : 0);

  // Get unique categories for the filter
  const uniqueCategories = categories.reduce(
    (acc, category) => {
      const existing = acc.find(
        (c) => c.categoryCode === category.categoryCode
      );
      if (!existing) {
        acc.push({
          categoryCode: category.categoryCode,
          categoryName: category.categoryName,
        });
      }
      return acc;
    },
    [] as Array<{ categoryCode: string; categoryName: string }>
  );

  return (
    <div className="flex flex-col gap-4 p-4 shadow-md bg-white/50 border rounded-md">
      <div className="flex items-center gap-4">
        <Input
          placeholder="Tìm kiếm món ăn theo tên, mã hoặc mô tả..."
          value={filters.searchText}
          className="bg-white"
          onChange={(e) => onFilterChange("searchText", e.target.value)}
          startAddon={<Search className="text-muted-foreground" />}
        />

        <Select
          value={filters.categoryCode || "all"}
          onValueChange={(value) =>
            onFilterChange("categoryCode", value === "all" ? "" : value)
          }
        >
          <SelectTrigger className="shadow-md bg-white w-[200px]">
            <SelectValue placeholder="Chọn danh mục" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả danh mục</SelectItem>
            {uniqueCategories.map((category) => (
              <SelectItem
                key={category.categoryCode}
                value={category.categoryCode}
              >
                {category.categoryName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.activeFilter}
          onValueChange={(value) =>
            onFilterChange(
              "activeFilter",
              value as MenuItemFilters["activeFilter"]
            )
          }
        >
          <SelectTrigger className="shadow-md bg-white w-[200px]">
            <SelectValue placeholder="Chọn trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Đang hoạt động</SelectItem>
            <SelectItem value="all">Tất cả</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={onAddItem}>
          <Plus className="h-4 w-4 mr-2" />
          Thêm món ăn
        </Button>

        {activeFiltersCount > 0 && (
          <Button variant="outline" onClick={onResetFilters}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Đặt lại bộ lọc
          </Button>
        )}
      </div>

      {selectedCount > 0 && (
        <div className="flex items-center justify-between p-3 bg-muted rounded-md animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{selectedCount} món ăn được chọn</Badge>
            <Button variant="ghost" size="sm" onClick={onClearSelection}>
              Bỏ chọn
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onExportExcel}>
              <Download className="h-4 w-4 mr-2" />
              Xuất Excel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
