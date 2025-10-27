import type { ReactNode } from "react";
import type { ServiceTypeFilters } from "../container/service-types-filter.hooks";
import ServiceTypesCommandBar from "../fragments/service-types/service-types-command-bar";

interface ServiceTypesViewLayoutProps {
  children: ReactNode;
  filters: ServiceTypeFilters;
  onFilterChange: <K extends keyof ServiceTypeFilters>(
    key: K,
    value: ServiceTypeFilters[K]
  ) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  totalTypes: number;
  selectedCount: number;
  onAddType: () => void;
  onExportExcel: () => void;
  onClearSelection: () => void;
}

export default function ServiceTypesViewLayout({
  children,
  filters,
  onFilterChange,
  searchQuery,
  setSearchQuery,
  totalTypes,
  selectedCount,
  onAddType,
  onExportExcel,
  onClearSelection,
}: ServiceTypesViewLayoutProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Quản lý loại dịch vụ
              </h1>
              <p className="text-muted-foreground mt-1">
                Quản lý các loại dịch vụ và danh mục của khách sạn
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm text-muted-foreground">
                Tổng số:{" "}
                <span className="font-semibold text-foreground">
                  {totalTypes}
                </span>{" "}
                loại dịch vụ
              </div>
            </div>
          </div>
        </div>

        {/* Command Bar */}
        <ServiceTypesCommandBar
          filters={filters}
          onFilterChange={onFilterChange}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCount={selectedCount}
          onAddType={onAddType}
          onExportExcel={onExportExcel}
          onClearSelection={onClearSelection}
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto bg-background">{children}</main>
    </div>
  );
}
