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
import CreateServiceDialog from "../../components/create-service.dialog";
import { useState } from "react";

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
    <div className="flex flex-col gap-4 p-4 shadow-md h-fit border rounded-md">
      <div className="flex flex-col items-center gap-4">
        <Input
          placeholder="Tìm kiếm dịch vụ theo tên, mã hoặc mô tả..."
          value={filters.searchText}
          className="bg-white"
          onChange={(e) => updateFilter("searchText", e.target.value)}
          startAddon={<Search className="text-muted-foreground" />}
        />

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
        {activeFiltersCount > 0 && (
          <Button variant={"outline"} onClick={resetFilters}>
            <RotateCcw />
            Đặt lại bộ lọc
          </Button>
        )}
      </div>

      <CreateServiceDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
      />
    </div>
  );
}
