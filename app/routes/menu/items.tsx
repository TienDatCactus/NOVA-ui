import type { Route } from "./+types/items";
import useMenuItemsContainer from "./container/use-menu-items-container.hooks";
import useDeleteMenuItem from "./container/use-delete-menu-item.hooks";
import useUpdateMenuItem from "./container/use-update-menu-item.hooks";
import useMenuItemDetail from "./container/use-menu-item-detail.hooks";
import useMenuCategoryList from "./container/use-menu-category-list.hooks";
import { useUnits } from "../units/container/unit-query.hooks";
import MenuItemsList from "./components/menu-items-list";
import MenuItemsViewLayout from "./layouts/menu-items-view.layout";
import CreateMenuItemDialog from "./components/create-menu-item.dialog";
import EditMenuItemSheet from "./components/edit-menu-item.sheet";
import DeleteMenuItemDialog from "./components/delete-menu-item.dialog";
import type {
  UpdateMenuItemRequestDto,
  MenuItem,
} from "~/services/api/menu-item/dto";

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
    deleteDialogOpen,
    setDeleteDialogOpen,
    selectedMenuItem,
    handleAddItem,
    handleDeleteItem,
    handleClearSelection,
    handleExportExcel,
    refetch,
  } = useMenuItemsContainer();

  const { data: menuCategories = [] } = useMenuCategoryList();
  const { data: units = [] } = useUnits();
  const { mutate: deleteMenuItem, isPending: isDeleting } = useDeleteMenuItem();

  // Fetch detail when editing
  const { data: menuItemDetail, isPending: isLoadingDetail } =
    useMenuItemDetail(editSheetOpen ? selectedMenuItem?.itemId || null : null);

  const { mutate: updateMenuItem, isPending: isUpdating } = useUpdateMenuItem(
    menuItemDetail?.id || ""
  );

  // Flatten all items for total count
  const allItems = filteredMenuItems.flatMap((category) => category.items);

  const handleConfirmDelete = () => {
    if (!selectedMenuItem) return;

    deleteMenuItem(selectedMenuItem.itemId, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        refetch();
      },
    });
  };

  const handleUpdateSubmit = (
    itemId: string,
    formData: Omit<UpdateMenuItemRequestDto, "components">
  ) => {
    const data: UpdateMenuItemRequestDto = {
      ...formData,
      components: [],
    };

    updateMenuItem(data, {
      onSuccess: () => {
        setEditSheetOpen(false);
        refetch();
      },
    });
  };

  const handleEditItem = (menuItem: MenuItem) => {
    setSelectedMenuItems([menuItem]);
    setEditSheetOpen(true);
  };

  // Transform menuCategories to match the expected format for EditMenuItemSheet
  const categoriesForEdit = menuCategories.map((cat) => ({
    categoryId: cat.id,
    categoryCode: cat.code,
    categoryName: cat.name,
    active: cat.active,
    items: [],
  }));

  return (
    <MenuItemsViewLayout
      filters={filters}
      onFilterChange={updateFilter}
      onResetFilters={resetFilters}
      totalItems={allItems.length}
      selectedCount={selectedMenuItems.length}
      onAddItem={handleAddItem}
      onExportExcel={handleExportExcel}
      onClearSelection={handleClearSelection}
      categories={filteredMenuItems}
    >
      <MenuItemsList
        data={allItems}
        isLoading={isPending}
        onSelectionChange={setSelectedMenuItems}
        onEdit={handleEditItem}
        onDelete={handleDeleteItem}
      />

      <CreateMenuItemDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      <EditMenuItemSheet
        open={editSheetOpen}
        onOpenChange={setEditSheetOpen}
        menuItemDetail={menuItemDetail || null}
        categories={categoriesForEdit}
        units={units}
        onSubmit={handleUpdateSubmit}
        isPending={isUpdating || isLoadingDetail}
      />

      <DeleteMenuItemDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        menuItem={selectedMenuItem}
        onConfirm={handleConfirmDelete}
        isPending={isDeleting}
      />
    </MenuItemsViewLayout>
  );
}
