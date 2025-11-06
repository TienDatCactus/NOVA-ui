import type { ReactNode } from "react";
import UnitsFilterSidebar from "../components/units-filter-sidebar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Plus } from "lucide-react";

interface UnitsViewLayoutProps {
  filters: {
    searchQuery: string;
    isActive: string;
  };
  onFilterChange: (key: string, value: string) => void;
  onResetFilters: () => void;
  totalUnits: number;
  activeUnits: number;
  inactiveUnits: number;
  onAddUnit: () => void;
  children: ReactNode;
}

function UnitsViewLayout({
  filters,
  onFilterChange,
  onResetFilters,
  totalUnits,
  activeUnits,
  inactiveUnits,
  onAddUnit,
  children,
}: UnitsViewLayoutProps) {
  return (
    <div className="flex gap-6">
      <UnitsFilterSidebar
        filters={filters}
        onFilterChange={onFilterChange}
        onResetFilters={onResetFilters}
      />
      <main className="flex-1 space-y-4">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">Quản lý đơn vị tính</h1>
              <Badge variant="secondary" className="text-sm">
                {totalUnits} đơn vị
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={onAddUnit}>
                <Plus className="mr-2 h-4 w-4" />
                Thêm đơn vị tính
              </Button>
            </div>
          </div>
          <p className="text-muted-foreground mt-2">
            Quản lý các đơn vị tính được sử dụng trong hệ thống
          </p>
        </div>
        {children}
      </main>
    </div>
  );
}

export default UnitsViewLayout;
