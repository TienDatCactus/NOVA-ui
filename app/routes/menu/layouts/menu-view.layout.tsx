import type { ReactNode } from "react";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import type { MenuFilters } from "~/services/api/menu/menu.types";
import { useMenuCategories } from "../container/menu-categories/query.hooks";

interface MenuViewLayoutProps {
  children: ReactNode;
  totalMenuItems: number;
  updateFilter: <K extends keyof MenuFilters>(
    key: K,
    value: MenuFilters[K]
  ) => void;
  resetFilters: () => void;
  filters: MenuFilters;
}

export default function MenuViewLayout({
  children,
  totalMenuItems,
  updateFilter,
  resetFilters,
  filters,
}: MenuViewLayoutProps) {
  const { data: menuCategories } = useMenuCategories();

  return (
    <div className="flex gap-6 p-4 ">
      <div className="flex-1  space-y-4">
        <div className="flex items-center justify-between">
          <div className="grid gap-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Quản lý thực đơn
            </h1>
            <p className="text-muted-foreground ">
              Tổng{" "}
              <span className="font-semibold text-foreground">
                {totalMenuItems}
              </span>{" "}
              dịch vụ
            </p>
          </div>
          <div className="flex items-center gap-2 w-xs">
            <div className="flex items-center gap-2 flex-1">
              <Label className="cursor-pointer">Tất cả món hoạt động</Label>
              <Switch
                value={filters.activeFilter}
                onCheckedChange={(value) =>
                  updateFilter("activeFilter", value ? "active" : "")
                }
              />
            </div>
            <div>
              <Select
                value={filters.categoryCode || ""}
                onValueChange={(value) => updateFilter("categoryCode", value)}
              >
                <SelectTrigger className="shadow-md w-40 bg-white w-full">
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  {menuCategories?.map((category) => (
                    <SelectItem key={category.id} value={category.code}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
