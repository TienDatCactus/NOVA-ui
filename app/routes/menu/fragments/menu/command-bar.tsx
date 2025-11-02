import { Plus, RotateCcw, Search } from "lucide-react";
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
import type { MenuFilters } from "~/services/types/menu.types";
import CreateMenuDialog from "../../components/create-menu.dialog";

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
    <div className="flex flex-co h-fit gap-4 p-4 shadow-md bg-white/50 border rounded-md">
      <div className="flex flex-col items-center gap-4">
        <Input
          placeholder="Tìm kiếm món ăn theo tên, mã hoặc mô tả..."
          value={filters.searchText}
          className="bg-white"
          onChange={(e) => updateFilter("searchText", e.target.value)}
          startAddon={<Search className="text-muted-foreground" />}
        />

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

        {activeFiltersCount > 0 && (
          <Button variant="outline" onClick={resetFilters}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Đặt lại bộ lọc
          </Button>
        )}
      </div>

      <CreateMenuDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
      />
    </div>
  );
}
