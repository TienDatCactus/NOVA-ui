import { Search, Plus, Download, RotateCcw, X } from "lucide-react";
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
import { useState } from "react";
import CreateServiceTypeDialog from "../../components/create-service-type.dialog";
import useServiceTypeFilters, {
  type ServiceTypeFilters,
} from "../../container/service-types/filter.hooks";
import { Label } from "~/components/ui/label";
import { Card } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
interface ServiceTypesCommandBarProps {
  filters: ServiceTypeFilters;
  resetFilters: () => void;
  updateFilter: <K extends keyof ServiceTypeFilters>(
    key: K,
    value: ServiceTypeFilters[K]
  ) => void;
}

export default function ServiceTypesCommandBar({
  filters,
  resetFilters,
  updateFilter,
}: ServiceTypesCommandBarProps) {
  const [open, setOpen] = useState(false);
  const activeFiltersCount =
    (filters.searchText !== "" ? 1 : 0) + (filters.activeFilter !== "" ? 1 : 0);
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
            Bộ lọc loại dịch vụ
          </Label>
          <Input
            placeholder="Tìm kiếm dịch vụ theo tên, mã hoặc mô tả..."
            value={filters.searchText}
            className="bg-white"
            onChange={(e) => updateFilter("searchText", e.target.value)}
            startAddon={<Search className="text-muted-foreground" />}
          />
          <Separator />
          <Select
            value={filters.activeFilter}
            onValueChange={(value) =>
              updateFilter(
                "activeFilter",
                value as ServiceTypeFilters["activeFilter"]
              )
            }
          >
            <SelectTrigger className="shadow-md bg-white w-full">
              <SelectValue placeholder="Chọn trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Đang hoạt động</SelectItem>
              <SelectItem value="all">Tất cả</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm loại dịch vụ
          </Button>
        </div>

        <CreateServiceTypeDialog onClose={() => setOpen(false)} open={open} />
      </Card>
    </aside>
  );
}
