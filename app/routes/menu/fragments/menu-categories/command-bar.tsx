import { Plus, RotateCcw, Search, Trash2, X } from "lucide-react";
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
import { Card } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";

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
    <aside className="w-72 flex-shrink-0 space-y-2">
      <div className="flex items-center justify-between">
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="h-8 text-xs gap-1"
          >
            <X className="h-3 w-3" />
            Xóa ({activeFiltersCount})
          </Button>
        )}
      </div>
      <Card className="p-4 h-fit shadow-s">
        <div className="flex flex-col  gap-4">
          <Label htmlFor="search" className="text-sm font-medium">
            Bộ lọc danh mục thực đơn
          </Label>
          <Input
            placeholder="Tìm kiếm danh mục theo tên hoặc mã..."
            value={filters.searchText}
            onChange={(e) => updateFilter("searchText", e.target.value)}
            startAddon={<Search className="text-muted-foreground" />}
          />
          <Separator />
          <Select
            value={filters.activeFilter}
            onValueChange={(value) =>
              updateFilter(
                "activeFilter",
                value as MenuCategoryFilters["activeFilter"]
              )
            }
          >
            <SelectTrigger className="shadow-sm  w-full">
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
        </div>
        <CreateMenuCategoryDialog
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
        />
      </Card>
    </aside>
  );
}
