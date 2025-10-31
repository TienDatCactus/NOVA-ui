import type { ReactNode } from "react";
import type { ServiceFilters } from "~/services/types/service.types";
import { useServiceTypes } from "../container/service-types-query.hooks";
import ServicesCommandBar from "../fragments/services/command.bar";

interface ServicesViewLayoutProps {
  children: ReactNode;
  filters: ServiceFilters;
  onFilterChange: <K extends keyof ServiceFilters>(
    key: K,
    value: ServiceFilters[K]
  ) => void;
  onResetFilters: () => void;
  totalServices: number;
  selectedCount: number;
  onAddService: () => void;
  onBulkEdit: () => void;
  onExportExcel: () => void;
  onClearSelection: () => void;
}

export default function ServicesViewLayout({
  children,
  filters,
  onFilterChange,
  totalServices,
  selectedCount,
  onAddService,
  onBulkEdit,
  onExportExcel,
  onClearSelection,
  onResetFilters,
}: ServicesViewLayoutProps) {
  const { data: serviceTypes } = useServiceTypes();
  return (
    <div className="flex flex-col space-y-2 h-full">
      <div className="border-b ">
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

        <ServicesCommandBar
          serviceTypes={serviceTypes || []}
          filters={filters}
          onFilterChange={onFilterChange}
          selectedCount={selectedCount}
          onAddService={onAddService}
          onBulkEdit={onBulkEdit}
          onExportExcel={onExportExcel}
          onClearSelection={onClearSelection}
          onResetFilters={onResetFilters}
        />
      </div>

      <main className="flex-1">{children}</main>
    </div>
  );
}
