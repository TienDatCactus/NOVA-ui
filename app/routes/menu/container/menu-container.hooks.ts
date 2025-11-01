import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { MenuListItemDto } from "~/services/api/menu/dto";
import useMenuFilters from "./menu-filter.hooks";
import { useDeleteMenuItem } from "./menu-mutation.hooks";
import { useMenuList, useMenuListByCategory } from "./menu-query.hooks";

export default function useMenuContainer() {
  const [selectedMenuItems, setSelectedMenuItems] = useState<MenuListItemDto[]>(
    []
  );
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuListItemDto | null>(null);

  const { filters, updateFilter, resetFilters, filterMenuItems } =
    useMenuFilters();

  // Fetch menu data based on category filter
  const { data: allMenuData, isPending: isAllPending } = useMenuList();
  const { data: categoryMenuData, isPending: isCategoryPending } =
    useMenuListByCategory(filters.categoryId);

  const { mutate: deleteMenuItem } = useDeleteMenuItem();

  // Use category-specific data if categoryId is set, otherwise use all menu
  const menuData = filters.categoryId ? categoryMenuData : allMenuData;
  const isPending = filters.categoryId ? isCategoryPending : isAllPending;

  const filteredMenuItems = useMemo(() => {
    if (!menuData) return [];
    return filterMenuItems(menuData);
  }, [menuData, filterMenuItems]);

  const handleEdit = (item: MenuListItemDto) => {
    setEditingItem(item);
    setEditSheetOpen(true);
  };

  const handleDelete = (item: MenuListItemDto) => {
    deleteMenuItem(item.itemId);
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
  };
}
