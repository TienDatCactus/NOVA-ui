import { Search, Plus, Download, Edit, LayoutGrid, List } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import type {
  ServiceFilters,
  ServiceDensity,
} from "~/services/types/service.types";
import { Badge } from "~/components/ui/badge";

interface ServicesCommandBarProps {
  filters: ServiceFilters;
  onFilterChange: <K extends keyof ServiceFilters>(
    key: K,
    value: ServiceFilters[K]
  ) => void;
  density: ServiceDensity;
  setDensity: (density: ServiceDensity) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCount: number;
  onAddService: () => void;
  onBulkEdit: () => void;
  onExportExcel: () => void;
  onClearSelection: () => void;
}

export default function ServicesCommandBar({
  filters,
  onFilterChange,
  density,
  setDensity,
  searchQuery,
  setSearchQuery,
  selectedCount,
  onAddService,
  onBulkEdit,
  onExportExcel,
  onClearSelection,
}: ServicesCommandBarProps) {
  return (
    <div className="flex flex-col gap-4 p-4 bg-card border-b">
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm dịch vụ theo tên, mã hoặc mô tả..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Service Type Filter - Segmented Control */}
        <Tabs
          value={filters.typeCode}
          onValueChange={(value) => onFilterChange("typeCode", value)}
        >
          <TabsList>
            <TabsTrigger value="all">Tất cả</TabsTrigger>
            <TabsTrigger value="SPA">Spa</TabsTrigger>
            <TabsTrigger value="FOOD">Thức ăn</TabsTrigger>
            <TabsTrigger value="DRINK">Đồ uống</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Active Filter */}
        <Select
          value={filters.includeInactive ? "all" : "active"}
          onValueChange={(value) =>
            onFilterChange("includeInactive", value === "all")
          }
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Đang hoạt động</SelectItem>
            <SelectItem value="all">Tất cả</SelectItem>
          </SelectContent>
        </Select>

        {/* Density Toggle */}
        <Tabs
          value={density}
          onValueChange={(v) => setDensity(v as ServiceDensity)}
        >
          <TabsList>
            <TabsTrigger value="comfortable">
              <LayoutGrid className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="compact">
              <List className="h-4 w-4" />
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Create Button */}
        <Button onClick={onAddService}>
          <Plus className="h-4 w-4 mr-2" />
          Thêm dịch vụ
        </Button>
      </div>

      {/* Bulk Actions Bar */}
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
