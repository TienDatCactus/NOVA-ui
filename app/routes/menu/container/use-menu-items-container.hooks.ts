import { useState } from "react";
import useMenuList from "./use-menu-list.hooks";
import useMenuItemFilter from "./use-menu-item-filter.hooks";
import useMenuItemDetail from "./use-menu-item-detail.hooks";
import type { MenuItem } from "~/services/api/menu-item/dto";

export default function useMenuItemsContainer() {
  const { data, isPending, refetch } = useMenuList();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditSheet, setShowEditSheet] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(
    null
  );

  // Fetch detail when editing
  const { data: menuItemDetail, isPending: isLoadingDetail } =
    useMenuItemDetail(showEditSheet ? selectedMenuItem?.itemId || null : null);

  const {
    searchQuery,
    setSearchQuery,
    selectedCategories,
    handleCategoryToggle,
    handleSelectAll,
    handleClearFilters,
    showInactive,
    setShowInactive,
    filteredData,
    flattenedItems,
    categories,
  } = useMenuItemFilter(data);

  const handleAddItem = () => {
    setShowCreateDialog(true);
  };

  const handleEditItem = (menuItem: MenuItem) => {
    setSelectedMenuItem(menuItem);
    setShowEditSheet(true);
  };

  const handleDeleteItem = (menuItem: MenuItem) => {
    setSelectedMenuItem(menuItem);
    setShowDeleteDialog(true);
  };

  const handleImport = () => {
    // TODO: Implement import
    console.log("Import clicked");
  };

  const handleExport = () => {
    // TODO: Implement export
    console.log("Export clicked");
  };

  return {
    // Data
    data: flattenedItems,
    categories,
    filteredCategories: filteredData,
    isPending,
    menuItemDetail,
    isLoadingDetail,

    // Stats
    totalItems: flattenedItems.length,
    selectedCount: 0, // TODO: Implement from table selection

    // Filters
    searchQuery,
    setSearchQuery,
    selectedCategories,
    handleCategoryToggle,
    handleSelectAll,
    handleClearFilters,
    showInactive,
    setShowInactive,

    // Actions
    handleAddItem,
    handleEditItem,
    handleDeleteItem,
    handleImport,
    handleExport,

    // Dialog states
    showCreateDialog,
    setShowCreateDialog,
    showEditSheet,
    setShowEditSheet,
    showDeleteDialog,
    setShowDeleteDialog,
    selectedMenuItem,

    refetch,
  };
}
