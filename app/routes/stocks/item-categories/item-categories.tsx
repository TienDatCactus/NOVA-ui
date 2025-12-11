import ItemCategoriesListView from "./components/item-categories-list-view";
import useItemCategoriesFilters from "./container/filters.hooks";
import { useItemCategories } from "./container/query.hooks";
import ItemCategoriesLayout from "./layouts/item-categories.layout";
import type { Route } from "./+types/item-categories";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Danh Mục Vật Tư - NOVA Hotel Management" },
    { name: "description", content: "Quản lý danh mục vật tư" },
  ];
}

export default function ItemCategoriesRoute() {
  const { filters, updateFilter } = useItemCategoriesFilters();
  const { data: categories, isPending } = useItemCategories({
    includeInactive: filters.activeFilter !== "active",
  });
  return (
    <ItemCategoriesLayout
      totalCategories={categories?.length ?? 0}
      filters={filters}
      updateFilter={updateFilter}
    >
      <ItemCategoriesListView
        categories={categories || []}
        isLoading={isPending}
      />
    </ItemCategoriesLayout>
  );
}
