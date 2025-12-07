import { useMemo } from "react";
import MenuCategoryDataTable from "./components/menu-category-list";
import { useMenuCategoryFilters } from "./container/menu-categories/filter.hooks";
import { useMenuCategories } from "./container/menu-categories/query.hooks";
import MenuCategoryViewLayout from "./layouts/menu-category-view.layout";
import { AuthLoader, RouteModule, Permission } from "~/lib/auth/auth.loader";

export const clientLoader = () =>
  AuthLoader.guard(RouteModule.MenuCategories, Permission.Read);

export default function MenuCategoriesPage() {
  const { filters, updateFilter, resetFilters } = useMenuCategoryFilters();

  const { data: categories, isPending } = useMenuCategories({
    includeInactive: filters.activeFilter !== "active",
  });

  return (
    <MenuCategoryViewLayout
      totalMenuCategories={categories?.length ?? 0}
      filters={filters}
      updateFilter={updateFilter}
      resetFilters={resetFilters}
    >
      <MenuCategoryDataTable
        menuCategories={categories || []}
        isLoading={isPending}
      />
    </MenuCategoryViewLayout>
  );
}
