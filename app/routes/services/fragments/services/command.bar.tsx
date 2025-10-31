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
import type { ServiceTypeListResponseDto } from "~/services/api/service-types/dto";
import type { ServiceFilters } from "~/services/types/service.types";

interface ServicesCommandBarProps {
  filters: ServiceFilters;
  onFilterChange: <K extends keyof ServiceFilters>(
    key: K,
    value: ServiceFilters[K]
  ) => void;
  selectedCount: number;
  onAddService: () => void;
  onBulkEdit: () => void;
  onExportExcel: () => void;
  onClearSelection: () => void;
  serviceTypes: ServiceTypeListResponseDto;
  onResetFilters: () => void;
}

export default function ServicesCommandBar({
  serviceTypes,
  filters,
  onFilterChange,
  selectedCount,
  onAddService,
  onBulkEdit,
  onExportExcel,
  onClearSelection,
  onResetFilters,
}: ServicesCommandBarProps) {
  const activeFiltersCount =
    (filters.searchText !== "" ? 1 : 0) +
    (filters.activeFilter !== "" ? 1 : 0) +
    (filters.typeCode !== "" ? 1 : 0);
  return (
    <div className="flex flex-col gap-4 p-4 shadow-md bg-white/50 border rounded-md">
      <div className="flex items-center gap-4">
        <Input
          placeholder="Tìm kiếm dịch vụ theo tên, mã hoặc mô tả..."
          value={filters.searchText}
          className="bg-white"
          onChange={(e) => onFilterChange("searchText", e.target.value)}
          startAddon={<Search className="text-muted-foreground" />}
        />

        <Select
          value={filters.typeCode || ""}
          onValueChange={(value) => onFilterChange("typeCode", value)}
        >
          <SelectTrigger className="shadow-md bg-white">
            <SelectValue placeholder="Chọn loại dịch vụ" />
          </SelectTrigger>
          <SelectContent>
            {!!serviceTypes &&
              serviceTypes.length > 0 &&
              serviceTypes.map((type) => (
                <SelectItem key={type.id} value={type.code}>
                  {type.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.activeFilter}
          onValueChange={(value) =>
            onFilterChange(
              "activeFilter",
              value as ServiceFilters["activeFilter"]
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

        <Button onClick={onAddService}>
          <Plus className="h-4 w-4 mr-2" />
          Thêm dịch vụ
        </Button>
        {activeFiltersCount > 0 && (
          <Button variant={"outline"} onClick={onResetFilters}>
            <RotateCcw />
            Đặt lại bộ lọc
          </Button>
        )}
      </div>

      {selectedCount > 0 && (
        <div className="flex items-center justify-between p-3 bg-muted rounded-md animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{selectedCount} dịch vụ được chọn</Badge>
            <Button variant="ghost" size="sm" onClick={onClearSelection}>
              Bỏ chọn
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onBulkEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Chỉnh sửa hàng loạt
            </Button>
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
