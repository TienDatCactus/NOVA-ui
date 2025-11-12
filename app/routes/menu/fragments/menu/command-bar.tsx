import { Plus, RotateCcw, Search, X } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import type { MenuCategoryListResponseDto } from "~/services/api/menu-category/dto";
import type { MenuFilters } from "~/services/api/menu/menu.types";
import CreateMenuDialog from "../../components/create-menu.dialog";
import { Card } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";

interface MenuCommandBarProps {
  menuCategories?: MenuCategoryListResponseDto;
  updateFilter: <K extends keyof MenuFilters>(
    key: K,
    value: MenuFilters[K]
  ) => void;
  resetFilters: () => void;
  filters: MenuFilters;
}

export default function MenuCommandBar({
  menuCategories = [],
  filters,
  updateFilter,
  resetFilters,
}: MenuCommandBarProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const activeFiltersCount =
    (filters.searchText !== "" ? 1 : 0) +
    (filters.activeFilter !== "" ? 1 : 0) +
    (filters.categoryCode !== "" ? 1 : 0);

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
      <Card className="p-4 h-fit shadow-sm">
        <div className="flex flex-col  gap-4">
          <Label htmlFor="search" className="text-sm font-medium">
            Bộ lọc thực đơn
          </Label>
          <Input
            placeholder="Tìm kiếm món ăn theo tên, mã hoặc mô tả..."
            value={filters.searchText}
            className="bg-white"
            onChange={(e) => updateFilter("searchText", e.target.value)}
            startAddon={<Search className="text-muted-foreground" />}
          />
          <Separator />
          <Select
            value={filters.categoryCode || ""}
            onValueChange={(value) => updateFilter("categoryCode", value)}
          >
            <SelectTrigger className="shadow-md bg-white w-full">
              <SelectValue placeholder="Chọn danh mục" />
            </SelectTrigger>
            <SelectContent>
              {menuCategories.length > 0 &&
                menuCategories.map((category) => (
                  <SelectItem key={category.id} value={category.code}>
                    {category.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.activeFilter}
            onValueChange={(value) =>
              updateFilter("activeFilter", value as MenuFilters["activeFilter"])
            }
          >
            <SelectTrigger className="shadow-md bg-white  w-full">
              <SelectValue placeholder="Chọn trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Đang hoạt động</SelectItem>
              <SelectItem value="all">Tất cả</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm món
          </Button>
        </div>

        <CreateMenuDialog
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
        />
      </Card>
    </aside>
  );
}
