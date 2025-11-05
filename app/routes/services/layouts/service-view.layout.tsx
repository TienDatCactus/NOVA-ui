import type { ReactNode } from "react";
import type { ServiceFilters } from "~/services/types/service.types";
import { useServiceTypes } from "../container/service-types/query.hooks";
import ServicesCommandBar from "../fragments/services/command.bar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Plus } from "lucide-react";

interface ServicesViewLayoutProps {
  children: ReactNode;
  filters: ServiceFilters;
  updateFilter: <K extends keyof ServiceFilters>(
    key: K,
    value: ServiceFilters[K]
  ) => void;
  resetFilters: () => void;
  totalServices: number;
  onAddService: () => void;
}

export default function ServicesViewLayout({
  children,
  filters,
  updateFilter,
  resetFilters,
  totalServices,
  onAddService,
}: ServicesViewLayoutProps) {
  const { data: serviceTypes } = useServiceTypes();
  return (
    <div className="flex gap-6">
      <ServicesCommandBar
        serviceTypes={serviceTypes || []}
        filters={filters}
        resetFilters={resetFilters}
        updateFilter={updateFilter}
      />

      <main className="flex-1 space-y-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">Quản lý dịch vụ</h1>
              <Badge variant="secondary" className="text-sm">
                {totalServices} dịch vụ
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Quản lý các dịch vụ và sản phẩm của NOVA
            </p>
          </div>
          <div className="flex items-center gap-2 pr-5">
            <Button onClick={onAddService} className="gap-2">
              <Plus className="h-4 w-4" />
              Thêm dịch vụ
            </Button>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}
