import type { Route } from "./+types/types";
import ServiceTypesDataTable from "./components/service-types-list";
import useServiceTypeFilters from "./container/service-types/filter.hooks";
import { useServiceTypes } from "./container/service-types/query.hooks";
import ServiceTypesViewLayout from "./layouts/service-types-view.layout";

export const action = async ({ request, params }: Route.ActionArgs) => {
  return {};
};

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  return {};
};

export default function Component({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const {
    filters,
    updateFilter,
    resetFilters,
    filterServiceTypes,
    includeInactive,
  } = useServiceTypeFilters();
  const { data: serviceTypesData, isPending } = useServiceTypes({
    includeInactive,
  });

  const filteredTypes = filterServiceTypes(serviceTypesData ?? []) ?? [];

  return (
    <ServiceTypesViewLayout
      totalTypes={filteredTypes.length}
      filters={filters}
      resetFilters={resetFilters}
      updateFilter={updateFilter}
    >
      <ServiceTypesDataTable types={filteredTypes} isLoading={isPending} />
    </ServiceTypesViewLayout>
  );
}
