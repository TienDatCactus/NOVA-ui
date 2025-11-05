import type { ReactNode } from "react";
import UnitsFilterSidebar from "../components/units-filter-sidebar";
import UnitsHeader from "../fragments/header.layout";

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
    <div className="flex h-full w-full">
      <UnitsFilterSidebar
        filters={filters}
        onFilterChange={onFilterChange}
        onResetFilters={onResetFilters}
      />

      <div className="flex-1 overflow-auto">
        <div className="px-6 py-6">
          <UnitsHeader
            totalUnits={totalUnits}
            activeUnits={activeUnits}
            inactiveUnits={inactiveUnits}
            onAddUnit={onAddUnit}
          />
          {children}
        </div>
      </div>
    </div>
  );
}

export default UnitsViewLayout;
