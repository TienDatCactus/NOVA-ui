import ItemCategoriesListView from "./components/item-categories-list-view";
import useItemCategoriesFilters from "./container/filters.hooks";
import { useItemCategories } from "./container/query.hooks";
import ItemCategoriesLayout from "./layouts/item-categories.layout";

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
