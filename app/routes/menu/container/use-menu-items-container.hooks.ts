import { useState } from "react";
import { toast } from "sonner";
import useMenuList from "./use-menu-list.hooks";
import useMenuItemFilter from "./use-menu-item-filter.hooks";
import type { MenuItem } from "~/services/api/menu-item/dto";

export default function useMenuItemsContainer() {
  const [selectedMenuItems, setSelectedMenuItems] = useState<MenuItem[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(
    null
  );

  const {
    filters,
    updateFilter,
    resetFilters,
    filterMenuItems,
    includeInactive,
  } = useMenuItemFilter();

  const { data: menuData, isPending, refetch } = useMenuList();

  const filteredMenuItems = menuData ? filterMenuItems(menuData) : [];

  const handleAddItem = () => {
    setCreateDialogOpen(true);
  };

  const handleEditItem = (menuItem: MenuItem) => {
    setSelectedMenuItem(menuItem);
    setEditSheetOpen(true);
  };

  const handleDeleteItem = (menuItem: MenuItem) => {
    setSelectedMenuItem(menuItem);
    setDeleteDialogOpen(true);
  };

  const handleClearSelection = () => {
    setSelectedMenuItems([]);
  };

  const handleExportExcel = () => {
    if (filteredMenuItems.length === 0) {
      toast.error("Không có dữ liệu để xuất");
      return;
    }

    toast.info("Tính năng xuất Excel sẽ được cập nhật sau");
  };

  return {
    filteredMenuItems,
    isPending,
    filters,
    updateFilter,
    resetFilters,
    includeInactive,
    selectedMenuItems,
    setSelectedMenuItems,
    createDialogOpen,
    setCreateDialogOpen,
    editSheetOpen,
    setEditSheetOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
    selectedMenuItem,
    setSelectedMenuItem,
    handleAddItem,
    handleEditItem,
    handleDeleteItem,
    handleClearSelection,
    handleExportExcel,
    refetch,
  };
}
