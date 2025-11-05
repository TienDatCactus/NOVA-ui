import type { ReactNode } from "react";
import UnitsCommandBar from "../fragments/command-bar";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Plus } from "lucide-react";

interface UnitsFilters {
  searchQuery: string;
  isActive: string;
}

interface UnitsViewLayoutProps {
  filters: UnitsFilters;
  updateFilter: <K extends keyof UnitsFilters>(
    key: K,
    value: UnitsFilters[K]
  ) => void;
  resetFilters: () => void;
  totalUnits: number;
  onAddUnit: () => void;
  children: ReactNode;
}

export default function UnitsViewLayout({
  filters,
  updateFilter,
  resetFilters,
  totalUnits,
  onAddUnit,
  children,
}: UnitsViewLayoutProps) {
  return (
    <div className="flex gap-6">
      <UnitsCommandBar
        filters={filters}
        updateFilter={updateFilter}
        resetFilters={resetFilters}
      />
      <main className="flex-1 space-y-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">Quản lý đơn vị</h1>
              <Badge variant="secondary" className="text-sm">
                {totalUnits} đơn vị
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Quản lý các đơn vị tính trong hệ thống
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={onAddUnit} className="gap-2">
              <Plus className="h-4 w-4" />
              Thêm đơn vị
            </Button>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}
