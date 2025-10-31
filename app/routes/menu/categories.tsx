import { useEffect } from "react";
import MenuCategoryDataTable from "./components/menu-category-list";
import MenuCategoriesViewLayout from "./layouts/menu-categories-view.layout";
import useMenuCategoriesContainer from "./container/menu-category-container.hooks";
import CreateMenuCategoryDialog from "./components/create-menu-category.dialog";
import EditMenuCategorySheet from "./components/edit-menu-category.sheet";

export const action = async () => {
  return {};
};

export const loader = async () => {
  return {};
};

export default function Component() {
  const {
    filteredCategories,
    isPending,
    filters,
    updateFilter,
    searchQuery,
    setSearchQuery,
    selectedCategories,
    setSelectedCategories,
    createDialogOpen,
    setCreateDialogOpen,
    editSheetOpen,
    setEditSheetOpen,
    editingCategory,
    handleEdit,
    handleDelete,
    handleClearSelection,
    handleExportExcel,
  } = useMenuCategoriesContainer();

  // Listen for custom events from action cells
  useEffect(() => {
    const handleEditEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      handleEdit(customEvent.detail);
    };

    const handleDeleteEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      handleDelete(customEvent.detail);
    };

    window.addEventListener("menu-category:edit", handleEditEvent);
    window.addEventListener("menu-category:delete", handleDeleteEvent);

    return () => {
      window.removeEventListener("menu-category:edit", handleEditEvent);
      window.removeEventListener("menu-category:delete", handleDeleteEvent);
    };
  }, [handleEdit, handleDelete]);

  return (
    <MenuCategoriesViewLayout
      filters={filters}
      onFilterChange={updateFilter}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      totalCategories={filteredCategories.length}
      selectedCount={selectedCategories.length}
      onAddCategory={() => setCreateDialogOpen(true)}
      onExportExcel={handleExportExcel}
      onClearSelection={handleClearSelection}
    >
      <MenuCategoryDataTable
        categories={filteredCategories}
        isLoading={isPending}
        onAddCategory={() => setCreateDialogOpen(true)}
        onSelectionChange={setSelectedCategories}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <CreateMenuCategoryDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
      />

      <EditMenuCategorySheet
        open={editSheetOpen}
        onClose={() => setEditSheetOpen(false)}
        category={editingCategory}
      />
    </MenuCategoriesViewLayout>
  );
}
