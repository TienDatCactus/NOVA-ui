import type { ReactNode } from "react";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import type { UnitFilters } from "../container/filter.hooks";

interface UnitsViewLayoutProps {
  filters: UnitFilters;
  updateFilter: <K extends keyof UnitFilters>(
    key: K,
    value: UnitFilters[K]
  ) => void;
  resetFilter: () => void;
  totalUnits: number;
  children: ReactNode;
}

function UnitsViewLayout({
  filters,
  updateFilter,
  totalUnits,
  children,
}: UnitsViewLayoutProps) {
  return (
    <div className="flex gap-6 p-4 ">
      <main className="flex-1 space-y-4">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="grid gap-2">
              <h1 className="text-3xl font-bold">Quản lý đơn vị tính</h1>
              <p className="text-muted-foreground">
                Tổng{" "}
                <span className="font-semibold text-foreground">
                  {totalUnits}
                </span>{" "}
                đơn vị
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Label>Hiển thị đơn vị không hoạt động</Label>
              <Switch
                checked={filters.activeFilter === "all" ? true : false}
                onCheckedChange={(checked) =>
                  updateFilter("activeFilter", checked ? "all" : "active")
                }
              />
            </div>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}

export default UnitsViewLayout;
