import CreateMenuCategoryDialog from "./components/create-menu-category.dialog";
import EditMenuCategorySheet from "./components/edit-menu-category.sheet";
import MenuCategoryViewLayout from "./layouts/menu-category-view.layout";
import { useMenuCategoryFilters } from "./container/menu-categories/filter.hooks";
import { useMemo, useState } from "react";
import MenuCategoryDataTable from "./components/menu-category-list";
import { useMenuCategories } from "./container/menu-categories/query.hooks";

/**
 * Main menu categories management page
 * Orchestrates all components and logic for category CRUD
 */
export default function MenuCategoriesPage() {
  const { filters, updateFilter, resetFilters, filterCategories, includeInactive } =
    useMenuCategoryFilters();

  const { data: categories, isPending } = useMenuCategories({
    includeInactive,
  });

  const filteredCategories = useMemo(() => {
    if (!categories) return [];
    return filterCategories(categories);
  }, [categories, filterCategories]);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  return (
    <>
      <MenuCategoryViewLayout
        totalMenuCategories={filteredCategories.length}
        filters={filters}
        updateFilter={updateFilter}
        resetFilters={resetFilters}
        onAddCategory={() => setCreateDialogOpen(true)}
      >
        <MenuCategoryDataTable
          menuCategories={filteredCategories}
          isLoading={isPending}
        />
      </MenuCategoryViewLayout>

      <CreateMenuCategoryDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
      />
    </>
  );
}

