import { Search, X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

interface UnitsFilterSidebarProps {
  filters: {
    searchQuery: string;
    isActive: string;
  };
  onFilterChange: (key: string, value: string) => void;
  onResetFilters: () => void;
}

export default function UnitsFilterSidebar({
  filters,
  onFilterChange,
  onResetFilters,
}: UnitsFilterSidebarProps) {
  const activeFiltersCount =
    (filters.searchQuery !== "" ? 1 : 0) + (filters.isActive !== "all" ? 1 : 0);

  return (
    <aside className="w-72 flex-shrink-0 space-y-2">
      <div className="flex items-center justify-between">
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            className="h-8 text-xs gap-1"
          >
            <X className="h-3 w-3" />
            Xóa ({activeFiltersCount})
          </Button>
        )}
      </div>
      <Card className="p-4 h-fit shadow-sm">
        <div className="flex flex-col gap-4">
          <Label htmlFor="search" className="text-sm font-medium">
            Bộ lọc đơn vị tính
          </Label>
          <Input
            placeholder="Mã, tên đơn vị..."
            value={filters.searchQuery}
            className="bg-white"
            onChange={(e) => onFilterChange("searchQuery", e.target.value)}
            startAddon={<Search className="text-muted-foreground" />}
          />
          <Separator />
          <Select
            value={filters.isActive}
            onValueChange={(value) => onFilterChange("isActive", value)}
          >
            <SelectTrigger className="shadow-md bg-white w-full">
              <SelectValue placeholder="Chọn trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Đang hoạt động</SelectItem>
              <SelectItem value="false">Ngừng hoạt động</SelectItem>
              <SelectItem value="all">Tất cả</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>
    </aside>
  );
}

