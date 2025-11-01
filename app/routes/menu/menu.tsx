import type { Route } from "./+types/menu";
import MenuDataTable from "./components/menu-list";
import { createColumns } from "./components/menu-list/columns";
import useMenuContainer from "./container/menu-container.hooks";
import MenuViewLayout from "./layouts/menu-view.layout";
import CreateMenuDialog from "./components/create-menu.dialog";
import EditMenuSheet from "./components/edit-menu.sheet";

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
    filteredMenuItems,
    isPending,
    filters,
    updateFilter,
    resetFilters,
    selectedMenuItems,
    setSelectedMenuItems,
    createDialogOpen,
    setCreateDialogOpen,
    editSheetOpen,
    setEditSheetOpen,
    editingItem,
    handleEdit,
    handleDelete,
    handleClearSelection,
    handleExportExcel,
  } = useMenuContainer();

  const columns = createColumns(handleEdit);

  return (
    <MenuViewLayout
      filters={filters}
      onFilterChange={updateFilter}
      onResetFilters={resetFilters}
      totalMenuItems={filteredMenuItems.length}
      selectedCount={selectedMenuItems.length}
      onAddMenuItem={() => setCreateDialogOpen(true)}
      onExportExcel={handleExportExcel}
      onClearSelection={handleClearSelection}
    >
      <MenuDataTable
        columns={columns}
        data={filteredMenuItems}
        isPending={isPending}
        selectedItems={selectedMenuItems}
        onSelectionChange={setSelectedMenuItems}
      />

      <CreateMenuDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
      />

      {editingItem && (
        <EditMenuSheet
          open={editSheetOpen}
          onClose={() => setEditSheetOpen(false)}
          itemId={editingItem.itemId}
        />
      )}
    </MenuViewLayout>
  );
}
