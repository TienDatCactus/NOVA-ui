import CreateUnitDialog from "./components/create-unit.dialog";
import UnitsViewLayout from "./layouts/units-view.layout";
import useUnitsContainer from "./container/container.hooks";
import { Card } from "~/components/ui/card";
import { useUnits } from "./container/unit-query.hooks";
import UnitsDataTable from "./components/units-list";

export function clientLoader() {
  return { title: "Đơn vị tính - NOVA" };
}

export default function Units() {
  const { refetch } = useUnits();
  const {
    filteredUnits,
    isPending,
    filters,
    updateFilter,
    resetFilters,
    stats,
    createDialogOpen,
    setCreateDialogOpen,
  } = useUnitsContainer();

  const hasFilters = !!(filters.searchQuery || filters.isActive !== "all");

  return (
    <UnitsViewLayout
      filters={filters}
      onFilterChange={updateFilter}
      onResetFilters={resetFilters}
      totalUnits={stats.total}
      activeUnits={stats.active}
      inactiveUnits={stats.inactive}
      onAddUnit={() => setCreateDialogOpen(true)}
    >
      <UnitsDataTable
        units={filteredUnits}
        isLoading={isPending}
        hasFilters={hasFilters}
        onAddUnit={() => setCreateDialogOpen(true)}
        onSuccess={refetch}
      />

      {/* Dialogs */}
      <CreateUnitDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={refetch}
      />
    </UnitsViewLayout>
  );
}
