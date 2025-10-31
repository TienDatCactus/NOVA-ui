import { useEffect } from "react";
import ServiceTypesDataTable from "./components/service-types-list";
import ServiceTypesViewLayout from "./layouts/service-types-view.layout";
import useServiceTypesContainer from "./container/service-types-container.hooks";
import CreateServiceTypeDialog from "./components/create-service-type.dialog";
import EditServiceTypeSheet from "./components/edit-service-type.sheet";
import type { Route } from "./+types/types";

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
    filteredTypes,
    isPending,
    filters,
    updateFilter,
    selectedTypes,
    setSelectedTypes,
    createDialogOpen,
    setCreateDialogOpen,
    editSheetOpen,
    setEditSheetOpen,
    editingType,
    handleEdit,
    handleDelete,
    handleClearSelection,
    handleExportExcel,
    resetFilters,
  } = useServiceTypesContainer();

  return (
    <ServiceTypesViewLayout
      filters={filters}
      onFilterChange={updateFilter}
      totalTypes={filteredTypes.length}
      selectedCount={selectedTypes.length}
      onAddType={() => setCreateDialogOpen(true)}
      onExportExcel={handleExportExcel}
      onClearSelection={handleClearSelection}
      onResetFilters={resetFilters}
    >
      <ServiceTypesDataTable
        types={filteredTypes}
        isLoading={isPending}
        onAddType={() => setCreateDialogOpen(true)}
        onSelectionChange={setSelectedTypes}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <CreateServiceTypeDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
      />
    </ServiceTypesViewLayout>
  );
}
