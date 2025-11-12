import type { ReactNode } from "react";
import ServiceTypesCommandBar from "../fragments/service-types/command-bar";
import type { ServiceTypeFilters } from "../container/service-types/filter.hooks";

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
      <ServiceTypesCommandBar
        filters={filters}
        resetFilters={resetFilters}
        updateFilter={updateFilter}
      />

      <div className="flex-1  space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Quản lý các loại dịch vụ
            </h1>
            <p className="text-muted-foreground mt-1">
              Quản lý các loại dịch vụ và sản phẩm của khách sạn
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground">
              Tổng số:{" "}
              <span className="font-semibold text-foreground">
                {totalTypes}
              </span>{" "}
              dịch vụ
            </div>
          </div>
        </div>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
