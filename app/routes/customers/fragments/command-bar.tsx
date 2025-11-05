import { Search, X, UserPlus } from "lucide-react";
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
import type { CustomerFilters } from "../container/filter.hooks";
import { getRoleDisplayName } from "~/services/types/customers.types";

interface CustomersCommandBarProps {
  filters: CustomerFilters;
  updateFilter: <K extends keyof CustomerFilters>(
    key: K,
    value: CustomerFilters[K]
  ) => void;
  resetFilters: () => void;
  roles: string[];
}

export default function CustomersCommandBar({
  filters,
  updateFilter,
  resetFilters,
  roles,
}: CustomersCommandBarProps) {
  const activeFiltersCount =
    (filters.searchText !== "" ? 1 : 0) +
    (filters.statusFilter !== "all" ? 1 : 0) +
    (filters.roleFilter !== "all" ? 1 : 0);

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
        <div className="flex flex-col gap-4">
          <Label htmlFor="search" className="text-sm font-medium">
            Bộ lọc tài khoản
          </Label>
          <Input
            placeholder="Tìm kiếm theo tên, email, tên đăng nhập..."
            value={filters.searchText}
            className="bg-white"
            onChange={(e) => updateFilter("searchText", e.target.value)}
            startAddon={<Search className="text-muted-foreground" />}
          />
          <Separator />
          <Select
            value={filters.statusFilter}
            onValueChange={(value) =>
              updateFilter(
                "statusFilter",
                value as CustomerFilters["statusFilter"]
              )
            }
          >
            <SelectTrigger className="shadow-md bg-white w-full">
              <SelectValue placeholder="Chọn trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="active">Hoạt động</SelectItem>
              <SelectItem value="locked">Bị khóa</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.roleFilter}
            onValueChange={(value) => updateFilter("roleFilter", value)}
          >
            <SelectTrigger className="shadow-md bg-white w-full">
              <SelectValue placeholder="Chọn vai trò" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Vai trò</SelectItem>
              {roles.map((role) => (
                <SelectItem key={role} value={role}>
                  {getRoleDisplayName(role)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>
    </aside>
  );
}
