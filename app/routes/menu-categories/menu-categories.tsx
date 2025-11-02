import CreateMenuCategoryDialog from "./components/create-menu-category.dialog";
import EditMenuCategorySheet from "./components/edit-menu-category.sheet";
import MenuCategoryViewLayout from "./layouts/menu-category-view.layout";
import { useMenuCategoryFilters } from "./container/menu-categories/filter.hooks";
import { useMenuCategoryList } from "./container/menu-categories/query.hooks";
import { useMemo } from "react";
import MenuCategoryDataTable from "./components/menu-category-list";

/**
 * Main menu categories management page
 * Orchestrates all components and logic for category CRUD
 */
export default function MenuCategoriesPage() {
  const { filters, updateFilter, resetFilters, filterCategories } =
    useMenuCategoryFilters();

  const {
    data: categories,
    isPending,
    refetch,
  } = useMenuCategoryList({
    includeInactive: filters.activeFilter !== "active",
  });

  const filteredCategories = useMemo(() => {
    if (!categories) return [];
    return filterCategories(categories);
  }, [categories, filterCategories]);

  return (
    <MenuCategoryViewLayout
      totalMenuCategories={filteredCategories.length}
      filters={filters}
      updateFilter={updateFilter}
      resetFilters={resetFilters}
    >
      <MenuCategoryDataTable
        menuCategories={filteredCategories}
        isLoading={isPending}
      />
    </MenuCategoryViewLayout>
  );
}
