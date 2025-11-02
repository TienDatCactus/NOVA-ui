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
import { useState } from "react";
import CreateServiceTypeDialog from "../../components/create-service-type.dialog";
import useServiceTypeFilters, {
  type ServiceTypeFilters,
} from "../../container/service-types/filter.hooks";
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
    <div className="flex flex-col gap-4 p-4 h-fit shadow-md  bg-white/50 border rounded-md">
      <div className="flex flex-col items-center gap-4">
        <Input
          placeholder="Tìm kiếm dịch vụ theo tên, mã hoặc mô tả..."
          value={filters.searchText}
          className="bg-white"
          onChange={(e) => updateFilter("searchText", e.target.value)}
          startAddon={<Search className="text-muted-foreground" />}
        />

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
        {activeFiltersCount > 0 && (
          <Button variant={"outline"} onClick={resetFilters}>
            <RotateCcw />
            Đặt lại bộ lọc
          </Button>
        )}
      </div>

      <CreateServiceTypeDialog onClose={() => setOpen(false)} open={open} />
    </div>
  );
}
