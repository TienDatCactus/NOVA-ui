import { AuthLoader, Permission, RouteModule } from "~/lib/auth/auth.loader";
import type { Route } from "./+types/services";
import ServicesDataTable from "./components/service-list";
import useServiceFilters from "./container/services/filter.hooks";
import { useServices } from "./container/services/query.hooks";
import ServicesViewLayout from "./layouts/service-view.layout";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dịch Vụ - NOVA Hotel Management" },
    { name: "description", content: "Quản lý dịch vụ khách sạn" },
  ];
}

export const clientLoader = () =>
  AuthLoader.guard(RouteModule.Services, Permission.Read);

export default function Component({}: Route.ComponentProps) {
  const {
    filters,
    updateFilter,
    resetFilters,
    filterServices,
    includeInactive,
  } = useServiceFilters();
  const { data: servicesData, isPending } = useServices({
    includeInactive,
    typeCode: filters.typeCode || undefined,
  });

  const filteredServices = servicesData ? filterServices(servicesData) : [];
  return (
    <ServicesViewLayout
      filters={filters}
      totalServices={filteredServices.length}
      resetFilters={resetFilters}
      updateFilter={updateFilter}
    >
      <ServicesDataTable services={filteredServices} isLoading={isPending} />
    </ServicesViewLayout>
  );
}
