import type { ReactNode } from "react";
import type {
  ServiceFilters,
  ServiceDensity,
} from "~/services/types/service.types";
import ServicesCommandBar from "../fragments/services/service-command.bar";

interface ServicesViewLayoutProps {
  children: ReactNode;
  filters: ServiceFilters;
  onFilterChange: <K extends keyof ServiceFilters>(
    key: K,
    value: ServiceFilters[K]
  ) => void;
  onResetFilters: () => void;
  density: ServiceDensity;
  setDensity: (density: ServiceDensity) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
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
  density,
  setDensity,
  searchQuery,
  setSearchQuery,
  totalServices,
  selectedCount,
  onAddService,
  onBulkEdit,
  onExportExcel,
  onClearSelection,
}: ServicesViewLayoutProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="p-6 pb-4">
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

        {/* Command Bar */}
        <ServicesCommandBar
          filters={filters}
          onFilterChange={onFilterChange}
          density={density}
          setDensity={setDensity}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCount={selectedCount}
          onAddService={onAddService}
          onBulkEdit={onBulkEdit}
          onExportExcel={onExportExcel}
          onClearSelection={onClearSelection}
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto bg-background">{children}</main>
    </div>
  );
}
