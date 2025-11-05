import type { ReactNode } from "react";
import ServiceTypesCommandBar from "../fragments/service-types/command-bar";
import type { ServiceTypeFilters } from "../container/service-types/filter.hooks";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Plus } from "lucide-react";

interface ServiceTypesViewLayoutProps {
  children: ReactNode;
  totalTypes: number;
  filters: ServiceTypeFilters;
  resetFilters: () => void;
  updateFilter: <K extends keyof ServiceTypeFilters>(
    key: K,
    value: ServiceTypeFilters[K]
  ) => void;
  onAddServiceType: () => void;
}

export default function ServiceTypesViewLayout({
  children,
  totalTypes,
  filters,
  resetFilters,
  updateFilter,
  onAddServiceType,
}: ServiceTypesViewLayoutProps) {
  return (
    <div className="flex gap-6">
      <ServiceTypesCommandBar
        filters={filters}
        resetFilters={resetFilters}
        updateFilter={updateFilter}
      />

      <main className="flex-1 space-y-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">Quản lý loại dịch vụ</h1>
              <Badge variant="secondary" className="text-sm">
                {totalTypes} loại
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Quản lý các loại dịch vụ và sản phẩm của khách sạn
            </p>
          </div>
          <div className="flex items-center gap-2 pr-5">
            <Button onClick={onAddServiceType} className="gap-2">
              <Plus className="h-4 w-4" />
              Thêm loại dịch vụ
            </Button>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}
