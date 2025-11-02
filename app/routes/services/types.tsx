import { useEffect } from "react";
import ServiceTypesDataTable from "./components/service-types-list";
import ServiceTypesViewLayout from "./layouts/service-types-view.layout";
import useServiceTypesContainer from "./container/service-types-container.hooks";
import CreateServiceTypeDialog from "./components/create-service-type.dialog";
import EditServiceTypeSheet from "./components/edit-service-type.sheet";
import type { Route } from "./+types/types";
import useServiceTypeFilters from "./container/service-types-filter.hooks";
import { useServiceTypes } from "./container/service-types-query.hooks";

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
    <ServiceTypesViewLayout totalTypes={filteredTypes.length}>
      <ServiceTypesDataTable types={filteredTypes} isLoading={isPending} />
    </ServiceTypesViewLayout>
  );
}
