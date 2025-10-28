import { useState } from "react";
import useMenuItemsContainer from "./container/use-menu-items-container.hooks";
import useDeleteMenuItem from "./container/use-delete-menu-item.hooks";
import useUpdateMenuItem from "./container/use-update-menu-item.hooks";
import { useUnits } from "../units/container/unit-query.hooks";
import MenuItemsList from "./components/menu-items-list";
import MenuItemsViewLayout from "./layouts/menu-items-view.layout";
import CreateMenuItemDialog from "./components/create-menu-item.dialog";
import EditMenuItemSheet from "./components/edit-menu-item.sheet";
import DeleteMenuItemDialog from "./components/delete-menu-item.dialog";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "~/components/ui/empty";
import { Package } from "lucide-react";
import type { UpdateMenuItemRequestDto } from "~/services/api/menu-item/dto";

export function clientLoader() {
  return { title: "Thực đơn - NOVA" };
}

export default function MenuItems() {
  const {
    data,
    categories,
    isPending,
    menuItemDetail,
    isLoadingDetail,
    totalItems,
    selectedCount,
    searchQuery,
    setSearchQuery,
    selectedCategories,
    handleCategoryToggle,
    handleSelectAll,
    handleClearFilters,
    showInactive,
    setShowInactive,
    handleAddItem,
    handleEditItem,
    handleDeleteItem,
    handleImport,
    handleExport,
    showCreateDialog,
    setShowCreateDialog,
    showEditSheet,
    setShowEditSheet,
    showDeleteDialog,
    setShowDeleteDialog,
    selectedMenuItem,
    refetch,
  } = useMenuItemsContainer();

  const { data: units = [] } = useUnits();
  const { mutate: deleteMenuItem, isPending: isDeleting } = useDeleteMenuItem();
  const { mutate: updateMenuItem, isPending: isUpdating } = useUpdateMenuItem(
    menuItemDetail?.id || ""
  );

  const handleConfirmDelete = () => {
    if (!selectedMenuItem) return;
    
    deleteMenuItem(selectedMenuItem.itemId, {
      onSuccess: () => {
        setShowDeleteDialog(false);
        refetch();
      },
    });
  };

  const handleUpdateSubmit = (itemId: string, formData: Omit<UpdateMenuItemRequestDto, 'components'>) => {
    // Convert form data to UpdateMenuItemRequestDto
    const data: UpdateMenuItemRequestDto = {
      ...formData,
      components: [], // Keep existing components empty for now
    };

    updateMenuItem(data, {
      onSuccess: () => {
        setShowEditSheet(false);
        refetch();
      },
    });
  };

  return (
    <>
      <MenuItemsViewLayout
        totalItems={totalItems}
        selectedCount={selectedCount}
        onAddItem={handleAddItem}
        onImport={handleImport}
        onExport={handleExport}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        categories={categories}
        selectedCategories={selectedCategories}
        onCategoryToggle={handleCategoryToggle}
        onSelectAll={handleSelectAll}
        onClearFilters={handleClearFilters}
        showInactive={showInactive}
        onToggleInactive={setShowInactive}
      >
        {isPending ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : data.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Package />
              </EmptyMedia>
              <EmptyTitle>Không có món ăn nào</EmptyTitle>
              <EmptyDescription>
                Bắt đầu thêm món ăn vào thực đơn của bạn
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <MenuItemsList 
            data={data} 
            onEdit={handleEditItem}
            onDelete={handleDeleteItem}
          />
        )}
      </MenuItemsViewLayout>

      {/* Dialogs */}
      <CreateMenuItemDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />

      <EditMenuItemSheet
        open={showEditSheet}
        onOpenChange={setShowEditSheet}
        menuItemDetail={menuItemDetail || null}
        categories={categories}
        units={units}
        onSubmit={handleUpdateSubmit}
        isPending={isUpdating || isLoadingDetail}
      />

      <DeleteMenuItemDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        menuItem={selectedMenuItem}
        onConfirm={handleConfirmDelete}
        isPending={isDeleting}
      />
    </>
  );
}