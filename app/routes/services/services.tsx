import { useState } from "react";
import type { Route } from "./+types/services";
import ServicesDataTable from "./components/service-list";
import useServiceFilters from "./container/services/filter.hooks";
import { useServices } from "./container/services/query.hooks";
import ServicesViewLayout from "./layouts/service-view.layout";
import CreateServiceDialog from "./components/create-service.dialog";

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
    filterServices,
    includeInactive,
  } = useServiceFilters();
  const { data: servicesData, isPending } = useServices({
    includeInactive,
    typeCode: filters.typeCode,
  });

  const filteredServices = servicesData ? filterServices(servicesData) : [];
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  return (
    <>
      <ServicesViewLayout
        filters={filters}
        totalServices={filteredServices.length}
        resetFilters={resetFilters}
        updateFilter={updateFilter}
        onAddService={() => setCreateDialogOpen(true)}
      >
        <ServicesDataTable services={filteredServices} isLoading={isPending} />
      </ServicesViewLayout>

      <CreateServiceDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
      />
    </>
  );
}
