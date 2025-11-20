import { useMemo } from "react";
import ItemsListView from "./components/items-list-view";
import ItemsStatsCards from "./components/items-stats-cards";
import useItemsFilters, { useItemsStats } from "./container/items.filter.hooks";
import { useStockItemList } from "./container/items.query.hooks";

export default function ItemsRoute() {
  const { filters, updateFilter, resetFilters, filterItems, sortItems } =
    useItemsFilters();

  const { data: items, isPending } = useStockItemList({
    includeInactive: filters.activeFilter !== "active",
  });

  const filteredItems = useMemo(() => {
    if (!items) return [];
    const filtered = filterItems(items);
    return sortItems(filtered, "name");
  }, [items, filters]);

  const stats = useItemsStats(filteredItems);

  return (
    <div className="flex h-full flex-col gap-6 p-6">
      <ItemsStatsCards stats={stats} isLoading={isPending} />

      <ItemsListView
        items={filteredItems}
        isLoading={isPending}
        filters={filters}
        updateFilter={updateFilter}
        resetFilters={resetFilters}
      />
    </div>
  );
}
