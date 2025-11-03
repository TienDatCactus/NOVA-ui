import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Search, Filter, CheckCircle2, XCircle, Circle } from "lucide-react";
import { Separator } from "~/components/ui/separator";
import { Card } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

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
}: UnitsFilterSidebarProps) {
  return (
    <Card className="w-72 flex flex-col shadow-sm">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary/10 p-2">
            <Filter className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Bộ lọc</h3>
            <p className="text-xs text-muted-foreground">
              Lọc danh sách đơn vị
            </p>
          </div>
        </div>

        <Separator />

        {/* Search */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold flex items-center gap-2">
            <Search className="h-3.5 w-3.5" />
            Tìm kiếm
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Mã, tên đơn vị..."
              className="pl-9 h-9"
              value={filters.searchQuery}
              onChange={(e) => onFilterChange("searchQuery", e.target.value)}
            />
          </div>
          {filters.searchQuery && (
            <p className="text-xs text-muted-foreground">
              Đang tìm:{" "}
              <Badge variant="secondary" className="text-xs">
                {filters.searchQuery}
              </Badge>
            </p>
          )}
        </div>

        <Separator />

        {/* Status Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Trạng thái</Label>
          <RadioGroup
            value={filters.isActive}
            onValueChange={(value) => onFilterChange("isActive", value)}
          >
            <div className="space-y-2">
              <label
                htmlFor="all"
                className={`flex items-center justify-between rounded-lg border p-3 cursor-pointer transition-colors hover:bg-muted/50 ${
                  filters.isActive === "all"
                    ? "border-primary bg-primary/5"
                    : "border-border"
                }`}
              >
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="all" id="all" />
                  <div className="flex items-center gap-2">
                    <Circle className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Tất cả</span>
                  </div>
                </div>
              </label>

              <label
                htmlFor="active"
                className={`flex items-center justify-between rounded-lg border p-3 cursor-pointer transition-colors hover:bg-muted/50 ${
                  filters.isActive === "true"
                    ? "border-green-600 bg-green-50 dark:bg-green-900/10"
                    : "border-border"
                }`}
              >
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="true" id="active" />
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Đang hoạt động</span>
                  </div>
                </div>
              </label>

              <label
                htmlFor="inactive"
                className={`flex items-center justify-between rounded-lg border p-3 cursor-pointer transition-colors hover:bg-muted/50 ${
                  filters.isActive === "false"
                    ? "border-gray-600 bg-gray-50 dark:bg-gray-900/10"
                    : "border-border"
                }`}
              >
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="false" id="inactive" />
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium">Ngừng hoạt động</span>
                  </div>
                </div>
              </label>
            </div>
          </RadioGroup>
        </div>
      </div>
    </Card>
  );
}
