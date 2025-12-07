import ItemsListView from "./components/items-list-view";
import useItemsFilters from "./container/filter.hooks";
import { useStockItemList } from "./container/query.hooks";
import ItemsLayout from "./layouts/items.layout";
import { AuthLoader, RouteModule, Permission } from "~/lib/auth/auth.loader";

export const clientLoader = () =>
  AuthLoader.guard(RouteModule.Stock, Permission.Read);

export default function ItemsRoute() {
  const { filters, updateFilter, resetFilters } = useItemsFilters();

  const { data: items, isPending } = useStockItemList({
    includeInactive: filters.activeFilter !== "active",
    lowStock: filters.lowStock,
    categoryId: filters.categoryId,
  });
  return (
    <ItemsLayout
      filters={filters}
      updateFilter={updateFilter}
      resetFilters={resetFilters}
      totalItems={items?.length ?? 0}
    >
      <ItemsListView items={items || []} isLoading={isPending} />
    </ItemsLayout>
  );
}
