import type { ReactNode } from "react";
import type { ServiceFilters } from "~/services/types/service.types";
import { useServiceTypes } from "../container/service-types/query.hooks";
import ServicesCommandBar from "../fragments/services/command.bar";

interface ServicesViewLayoutProps {
  children: ReactNode;
  filters: ServiceFilters;
  updateFilter: <K extends keyof ServiceFilters>(
    key: K,
    value: ServiceFilters[K]
  ) => void;
  resetFilters: () => void;
  totalServices: number;
}

export default function ServicesViewLayout({
  children,
  filters,
  updateFilter,
  resetFilters,
  totalServices,
}: ServicesViewLayoutProps) {
  const { data: serviceTypes } = useServiceTypes();
  return (
    <div className="flex flex-col space-y-2 h-full">
      <div className=" pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Quản lý dịch vụ
            </h1>
            <p className="text-muted-foreground mt-1">
              Quản lý các dịch vụ và sản phẩm của khách sạn
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground">
              Tổng số:{" "}
              <span className="font-semibold text-foreground">
                {totalServices}
              </span>{" "}
              dịch vụ
            </div>
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <ServicesCommandBar
          serviceTypes={serviceTypes || []}
          filters={filters}
          resetFilters={resetFilters}
          updateFilter={updateFilter}
        />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
