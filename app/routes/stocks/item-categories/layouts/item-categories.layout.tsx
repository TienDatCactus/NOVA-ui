import { Package } from "lucide-react";
import type { PropsWithChildren } from "react";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import type { ItemCategoriesFilter } from "../container/filters.hooks";

interface ItemCategoriesLayoutProps extends PropsWithChildren {
  totalCategories: number;
  filters: ItemCategoriesFilter;
  updateFilter: (key: keyof ItemCategoriesFilter, value: any) => void;
}

export default function ItemCategoriesLayout({
  totalCategories,
  children,
  filters,
  updateFilter,
}: ItemCategoriesLayoutProps) {
  return (
    <div className="grid gap-6 p-4">
      <div className="flex items-center justify-between">
        <div className="grid gap-2">
          <h1 className="text-3xl font-bold">Danh mục hàng hóa</h1>
          <p className="text-sm text-muted-foreground">
            Tổng{" "}
            <span className="font-semibold text-foreground">
              {totalCategories}
            </span>{" "}
            danh mục
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-6">
          <div className="grid gap-2">
            <div className="flex items-center gap-2">
              <Switch
                id="active-filter"
                checked={filters.activeFilter === "active"}
                onCheckedChange={(checked) =>
                  updateFilter("activeFilter", checked ? "active" : "inactive")
                }
              />
              <Label htmlFor="active-filter" className="cursor-pointer">
                Tất cả hàng hóa hoạt động
              </Label>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {children}
    </div>
  );
}
