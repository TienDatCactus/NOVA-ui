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
    flattenedServices,
    isPending,
    filters,
    updateFilter,
    resetFilters,
    density,
    setDensity,
    searchQuery,
    setSearchQuery,
    selectedServices,
    setSelectedServices,
    createDialogOpen,
    setCreateDialogOpen,
    editSheetOpen,
    setEditSheetOpen,
    bulkEditDialogOpen,
    setBulkEditDialogOpen,
    editingService,
    handleEdit,
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
      density={density}
      setDensity={setDensity}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      totalServices={flattenedServices.length}
      selectedCount={selectedServices.length}
      onAddService={() => setCreateDialogOpen(true)}
      onBulkEdit={() => setBulkEditDialogOpen(true)}
      onExportExcel={handleExportExcel}
      onClearSelection={handleClearSelection}
    >
      <ServicesDataTable
        services={flattenedServices}
        isLoading={isPending}
        density={density}
        onAddService={() => setCreateDialogOpen(true)}
        onSelectionChange={setSelectedServices}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <CreateServiceDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
      />

      <EditServiceSheet
        open={editSheetOpen}
        onClose={() => setEditSheetOpen(false)}
        service={editingService}
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
