import { Search, Plus, Download } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Badge } from "~/components/ui/badge";
import type { MenuCategoryFilters } from "../container/menu-category-filter.hooks";

interface MenuCategoryCommandBarProps {
  filters: MenuCategoryFilters;
  onFilterChange: <K extends keyof MenuCategoryFilters>(
    key: K,
    value: MenuCategoryFilters[K]
  ) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCount: number;
  onAddCategory: () => void;
  onExportExcel: () => void;
  onClearSelection: () => void;
}

export default function MenuCategoryCommandBar({
  filters,
  onFilterChange,
  searchQuery,
  setSearchQuery,
  selectedCount,
  onAddCategory,
  onExportExcel,
  onClearSelection,
}: MenuCategoryCommandBarProps) {
  return (
    <div className="flex flex-col gap-4 p-4 bg-card border-b">
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm danh mục thực đơn theo tên, mã..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Active Filter */}
        <Select
          value={filters.includeInactive ? "all" : "active"}
          onValueChange={(value) =>
            onFilterChange("includeInactive", value === "all")
          }
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Đang hoạt động</SelectItem>
            <SelectItem value="all">Tất cả</SelectItem>
          </SelectContent>
        </Select>

        {/* Create Button */}
        <Button onClick={onAddCategory}>
          <Plus className="h-4 w-4 mr-2" />
          Thêm danh mục
        </Button>
      </div>

      {/* Selection Bar */}
      {selectedCount > 0 && (
        <div className="flex items-center justify-between p-3 bg-muted rounded-md animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {selectedCount} danh mục được chọn
            </Badge>
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
