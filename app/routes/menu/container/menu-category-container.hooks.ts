import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { MenuCategoryItem } from "~/services/api/menu-category/dto";
import { useMenuCategories } from "./menu-category-query.hooks";
import useMenuCategoryFilters from "./menu-category-filter.hooks";
import { useDeleteMenuCategory } from "./menu-category-mutation.hooks";

export default function useMenuCategoriesContainer() {
  const { data: menuCategoriesData, isPending } = useMenuCategories();
  const { filters, updateFilter, resetFilters, filterMenuCategories } =
    useMenuCategoryFilters();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<
    MenuCategoryItem[]
  >([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<MenuCategoryItem | null>(null);

  const { mutate: deleteMenuCategory } = useDeleteMenuCategory();

  // Apply filters and search
  const filteredCategories = useMemo(() => {
    if (!menuCategoriesData) return [];

    let result = filterMenuCategories(menuCategoriesData);

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.code.toLowerCase().includes(query)
      );
    }

    return result;
  }, [menuCategoriesData, filterMenuCategories, searchQuery]);

  const handleEdit = (category: MenuCategoryItem) => {
    setEditingCategory(category);
    setEditSheetOpen(true);
  };

  const handleDelete = (category: MenuCategoryItem) => {
    deleteMenuCategory(category.id);
  };

  const handleClearSelection = () => {
    setSelectedCategories([]);
  };

  const handleExportExcel = () => {
    if (filteredCategories.length === 0) {
      toast.error("Không có dữ liệu để xuất");
      return;
    }

    toast.info("Tính năng xuất Excel sẽ được cập nhật sau");
  };

  return {
    filteredCategories,
    isPending,
    filters,
    updateFilter,
    resetFilters,
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
  };
}
