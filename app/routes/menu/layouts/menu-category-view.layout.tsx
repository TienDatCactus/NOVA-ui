import type { ReactNode } from "react";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import type { MenuCategoryFilters } from "../container/menu-categories/filter.hooks";

interface MenuCategoryViewLayoutProps {
  children: ReactNode;
  totalMenuCategories: number;
  updateFilter: <K extends keyof MenuCategoryFilters>(
    key: K,
    value: MenuCategoryFilters[K]
  ) => void;
  resetFilters: () => void;
  filters: MenuCategoryFilters;
}

export default function MenuCategoryViewLayout({
  children,
  totalMenuCategories,
  updateFilter,
  filters,
}: MenuCategoryViewLayoutProps) {
  return (
    <div className="flex gap-6 p-4 ">
      <div className="flex-1  space-y-4">
        <div className="flex items-center justify-between">
          <div className="grid gap-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Quản lý danh mục thực đơn
            </h1>
            <p className="text-muted-foreground ">
              Tổng{" "}
              <span className="font-semibold text-foreground">
                {totalMenuCategories}
              </span>{" "}
              danh mục món
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Label>Danh mục món đang hoạt động</Label>
              <Switch
                value={filters.activeFilter}
                onCheckedChange={(value) =>
                  updateFilter("activeFilter", value ? "active" : "all")
                }
              />
            </div>
          </div>
        </div>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
