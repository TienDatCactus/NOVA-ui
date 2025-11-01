import { Download, Edit, Plus, RotateCcw, Search } from "lucide-react";
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
import type { MenuFilters } from "~/services/types/menu.types";
import type { MenuCategoryListResponseDto } from "~/services/api/menu-category/dto";

interface MenuCommandBarProps {
  filters: MenuFilters;
  onFilterChange: <K extends keyof MenuFilters>(
    key: K,
    value: MenuFilters[K]
  ) => void;
  selectedCount: number;
  onAddMenuItem: () => void;
  onExportExcel: () => void;
  onClearSelection: () => void;
  onResetFilters: () => void;
  menuCategories?: MenuCategoryListResponseDto;
}

export default function MenuCommandBar({
  filters,
  onFilterChange,
  selectedCount,
  onAddMenuItem,
  onExportExcel,
  onClearSelection,
  onResetFilters,
  menuCategories = [],
}: MenuCommandBarProps) {
  const activeFiltersCount =
    (filters.searchText !== "" ? 1 : 0) +
    (filters.activeFilter !== "" ? 1 : 0) +
    (filters.categoryId !== "" ? 1 : 0);

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
          value={filters.categoryId || ""}
          onValueChange={(value) => onFilterChange("categoryId", value)}
        >
          <SelectTrigger className="shadow-md bg-white min-w-[200px]">
            <SelectValue placeholder="Chọn danh mục" />
          </SelectTrigger>
          <SelectContent>
            {menuCategories.length > 0 &&
              menuCategories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.activeFilter}
          onValueChange={(value) =>
            onFilterChange("activeFilter", value as MenuFilters["activeFilter"])
          }
        >
          <SelectTrigger className="shadow-md bg-white min-w-[180px]">
            <SelectValue placeholder="Chọn trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Đang hoạt động</SelectItem>
            <SelectItem value="all">Tất cả</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={onAddMenuItem}>
          <Plus className="h-4 w-4 mr-2" />
          Thêm món
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
            <Badge variant="secondary">{selectedCount} món được chọn</Badge>
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
