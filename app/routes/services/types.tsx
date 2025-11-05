import { useState } from "react";
import type { Route } from "./+types/types";
import ServiceTypesDataTable from "./components/service-types-list";
import useServiceTypeFilters from "./container/service-types/filter.hooks";
import { useServiceTypes } from "./container/service-types/query.hooks";
import ServiceTypesViewLayout from "./layouts/service-types-view.layout";
import CreateServiceTypeDialog from "./components/create-service-type.dialog";

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
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  return (
    <>
      <ServiceTypesViewLayout
        totalTypes={filteredTypes.length}
        filters={filters}
        resetFilters={resetFilters}
        updateFilter={updateFilter}
        onAddServiceType={() => setCreateDialogOpen(true)}
      >
        <ServiceTypesDataTable types={filteredTypes} isLoading={isPending} />
      </ServiceTypesViewLayout>

      <CreateServiceTypeDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
      />
    </>
  );
}
