import { Plus, RotateCcw, Search, X } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import type { ServiceTypeListResponseDto } from "~/services/api/service-types/dto";
import type { ServiceFilters } from "~/services/types/service.types";
import CreateServiceDialog from "../../components/create-service.dialog";

interface ServicesCommandBarProps {
  filters: ServiceFilters;
  updateFilter: <K extends keyof ServiceFilters>(
    key: K,
    value: ServiceFilters[K]
  ) => void;
  serviceTypes: ServiceTypeListResponseDto;
  resetFilters: () => void;
}

export default function ServicesCommandBar({
  serviceTypes,
  filters,
  updateFilter,
  resetFilters,
}: ServicesCommandBarProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const activeFiltersCount =
    (filters.searchText !== "" ? 1 : 0) +
    (filters.activeFilter !== "" ? 1 : 0) +
    (filters.typeCode !== "" ? 1 : 0);
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
            Bộ lọc dịch vụ
          </Label>
          <Input
            placeholder="Tìm kiếm dịch vụ theo tên, mã hoặc mô tả..."
            value={filters.searchText}
            className="bg-white"
            id="search"
            onChange={(e) => updateFilter("searchText", e.target.value)}
            startAddon={<Search className="text-muted-foreground" />}
          />
          <Separator />
          <Select
            value={filters.typeCode || ""}
            onValueChange={(value) => updateFilter("typeCode", value)}
          >
            <SelectTrigger className="shadow-md w-full bg-white">
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
              updateFilter(
                "activeFilter",
                value as ServiceFilters["activeFilter"]
              )
            }
          >
            <SelectTrigger className="shadow-md w-full bg-white">
              <SelectValue placeholder="Chọn trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Đang hoạt động</SelectItem>
              <SelectItem value="all">Tất cả</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm dịch vụ
          </Button>
        </div>

        <CreateServiceDialog
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
        />
      </Card>
    </aside>
  );
}
