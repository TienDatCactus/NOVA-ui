import { Search, Plus, Download, RotateCcw } from "lucide-react";
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
import type { ServiceTypeFilters } from "~/routes/services/container/service-types-filter.hooks";

interface ServiceTypesCommandBarProps {
  filters: ServiceTypeFilters;
  onFilterChange: <K extends keyof ServiceTypeFilters>(
    key: K,
    value: ServiceTypeFilters[K]
  ) => void;
  selectedCount: number;
  onExportExcel: () => void;
  onClearSelection: () => void;
  onAddType: () => void;
  onResetFilters: () => void;
}

export default function ServiceTypesCommandBar({
  filters,
  onFilterChange,
  selectedCount,
  onExportExcel,
  onClearSelection,
  onAddType,
  onResetFilters,
}: ServiceTypesCommandBarProps) {
  const activeFiltersCount =
    (filters.searchText !== "" ? 1 : 0) + (filters.activeFilter !== "" ? 1 : 0);
  return (
    <div className="flex flex-col gap-4 p-4 shadow-md  bg-white/50 border rounded-md">
      <div className="flex items-center gap-4">
        <Input
          placeholder="Tìm kiếm dịch vụ theo tên, mã hoặc mô tả..."
          value={filters.searchText}
          className="bg-white"
          onChange={(e) => onFilterChange("searchText", e.target.value)}
          startAddon={<Search className="text-muted-foreground" />}
        />

        <Select
          value={filters.activeFilter}
          onValueChange={(value) =>
            onFilterChange(
              "activeFilter",
              value as ServiceTypeFilters["activeFilter"]
            )
          }
        >
          <SelectTrigger className="shadow-md bg-white">
            <SelectValue placeholder="Chọn trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Đang hoạt động</SelectItem>
            <SelectItem value="all">Tất cả</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={onAddType}>
          <Plus className="h-4 w-4 mr-2" />
          Thêm loại dịch vụ
        </Button>
        {activeFiltersCount > 0 && (
          <Button variant={"outline"} onClick={onResetFilters}>
            <RotateCcw />
            Đặt lại bộ lọc
          </Button>
        )}
      </div>

      {/* Selection Bar */}
      {selectedCount > 0 && (
        <div className="flex items-center justify-between p-3 bg-muted rounded-md animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {selectedCount} loại dịch vụ được chọn
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
