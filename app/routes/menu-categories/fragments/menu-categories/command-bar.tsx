import { Plus, RotateCcw, Search, Trash2 } from "lucide-react";
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
import type { MenuCategoryFilters } from "../../container/menu-categories/filter.hooks";
import CreateMenuCategoryDialog from "../../components/create-menu-category.dialog";
import { useState } from "react";

interface MenuCategoryCommandBarProps {
  filters: MenuCategoryFilters;
  updateFilter: <K extends keyof MenuCategoryFilters>(
    key: K,
    value: MenuCategoryFilters[K]
  ) => void;
  resetFilters: () => void;
}

export default function MenuCategoryCommandBar({
  filters,
  updateFilter,
  resetFilters,
}: MenuCategoryCommandBarProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const activeFiltersCount =
    (filters.searchText !== "" ? 1 : 0) +
    (filters.activeFilter !== "all" ? 1 : 0);

  return (
    <div className="flex flex-col h-fit gap-4 p-4 shadow-sm bg-card border rounded-md">
      <div className="flex flex-col items-center gap-4">
        <Input
          placeholder="Tìm kiếm danh mục theo tên hoặc mã..."
          value={filters.searchText}
          className="bg-background"
          onChange={(e) => updateFilter("searchText", e.target.value)}
          startAddon={<Search className="text-muted-foreground" />}
        />

        <Select
          value={filters.activeFilter}
          onValueChange={(value) =>
            updateFilter(
              "activeFilter",
              value as MenuCategoryFilters["activeFilter"]
            )
          }
        >
          <SelectTrigger className="shadow-sm bg-background w-full">
            <SelectValue placeholder="Chọn trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="active">Đang hoạt động</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={() => setCreateDialogOpen(true)} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Thêm danh mục
        </Button>

        {activeFiltersCount > 0 && (
          <Button variant="outline" onClick={resetFilters} className="w-full">
            <RotateCcw className="h-4 w-4 mr-2" />
            Đặt lại bộ lọc ({activeFiltersCount})
          </Button>
        )}
      </div>
      <CreateMenuCategoryDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
      />
    </div>
  );
}
