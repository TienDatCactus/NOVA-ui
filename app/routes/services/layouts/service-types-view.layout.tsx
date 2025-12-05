import type { ReactNode } from "react";
import type { ServiceTypeFilters } from "../container/service-types/filter.hooks";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";

interface ServiceTypesViewLayoutProps {
  children: ReactNode;
  totalTypes: number;
  filters: ServiceTypeFilters;
  resetFilters: () => void;
  updateFilter: <K extends keyof ServiceTypeFilters>(
    key: K,
    value: ServiceTypeFilters[K]
  ) => void;
}

export default function ServiceTypesViewLayout({
  children,
  totalTypes,
  filters,
  resetFilters,
  updateFilter,
}: ServiceTypesViewLayoutProps) {
  return (
    <div className="flex gap-6 p-4">
      <div className="flex-1  space-y-4">
        <div className="flex items-center justify-between">
          <div className="grid gap-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Quản lý các loại dịch vụ
            </h1>
            <p className="text-muted-foreground ">
              Tổng{" "}
              <span className="font-semibold text-foreground">
                {totalTypes}
              </span>{" "}
              loại dịch vụ
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 flex-1">
              <Label htmlFor="active-filter" className="cursor-pointer ">
                Tất cả loại dịch vụ
              </Label>
              <Switch
                id="active-filter"
                checked={filters.activeFilter === "all"}
                onCheckedChange={(checked) =>
                  updateFilter("activeFilter", checked ? "all" : "active")
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
