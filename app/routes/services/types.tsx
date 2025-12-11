import type { Route } from "./+types/types";
import ServiceTypesDataTable from "./components/service-types-list";
import useServiceTypeFilters from "./container/service-types/filter.hooks";
import { useServiceTypes } from "./container/service-types/query.hooks";
import ServiceTypesViewLayout from "./layouts/service-types-view.layout";
import { AuthLoader, RouteModule, Permission } from "~/lib/auth/auth.loader";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Loại Dịch Vụ - NOVA Hotel Management" },
    { name: "description", content: "Quản lý loại dịch vụ khách sạn" },
  ];
}

export const clientLoader = () =>
  AuthLoader.guard(RouteModule.ServiceTypes, Permission.Read);

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
