import type { Route } from "./+types/services";
import { useEffect } from "react";
import ServicesDataTable from "./components/service-list";
import useServicesContainer from "./container/service-container.hooks";
import CreateServiceDialog from "./components/create-service.dialog";
import EditServiceSheet from "./components/edit-service.sheet";
import ServicesViewLayout from "./layouts/service-view.layout";
import BulkEditDialog from "./fragments/services/bulk-edit.dialog";

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
    filteredServices,
    isPending,
    filters,
    updateFilter,
    resetFilters,
    selectedServices,
    setSelectedServices,
    createDialogOpen,
    setCreateDialogOpen,
    bulkEditDialogOpen,
    setBulkEditDialogOpen,
    handleDelete,
    handleBulkEdit,
    handleClearSelection,
    handleExportExcel,
  } = useServicesContainer();

  return (
    <ServicesViewLayout
      filters={filters}
      onFilterChange={updateFilter}
      onResetFilters={resetFilters}
      totalServices={filteredServices.length}
      selectedCount={selectedServices.length}
      onAddService={() => setCreateDialogOpen(true)}
      onBulkEdit={() => setBulkEditDialogOpen(true)}
      onExportExcel={handleExportExcel}
      onClearSelection={handleClearSelection}
    >
      <ServicesDataTable
        services={filteredServices}
        isLoading={isPending}
        onSelectionChange={setSelectedServices}
        onDelete={handleDelete}
      />

      <CreateServiceDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
      />

      <BulkEditDialog
        open={bulkEditDialogOpen}
        onClose={() => setBulkEditDialogOpen(false)}
        selectedServices={selectedServices}
        onSubmit={handleBulkEdit}
      />
    </ServicesViewLayout>
  );
}
