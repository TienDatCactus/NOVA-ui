import UnitsDataTable from "./components/units-list";
import useUnitFilters from "./container/filter.hooks";
import { useUnits } from "./container/unit-query.hooks";
import UnitsViewLayout from "./layouts/units-view.layout";
import { AuthLoader, RouteModule, Permission } from "~/lib/auth/auth.loader";

export const clientLoader = () =>
  AuthLoader.guard(RouteModule.Units, Permission.Read);

export default function Units() {
  const { refetch } = useUnits();
  const { filters, updateFilter, resetFilters } = useUnitFilters();
  const { data: units, isPending } = useUnits({
    includeInactive: filters.activeFilter === "all",
  });

  return (
    <UnitsViewLayout
      filters={filters}
      updateFilter={updateFilter}
      resetFilter={resetFilters}
      totalUnits={units?.length || 0}
    >
      <UnitsDataTable units={units ?? []} isLoading={isPending} />
    </UnitsViewLayout>
  );
}
