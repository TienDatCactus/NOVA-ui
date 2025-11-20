import { useMemo } from "react";
import ItemsListView from "./components/items-list-view";
import ItemsStatsCards from "./components/items-stats-cards";
import useItemsFilters, { useItemsStats } from "./container/items.filter.hooks";
import {
  useLowStockItems,
  useStockItemList,
} from "./container/items.query.hooks";

export default function ItemsRoute() {
  const { filters, updateFilter, resetFilters } = useItemsFilters();

  const { data: items, isPending } = useStockItemList({
    includeInactive: filters.activeFilter !== "active",
  });
  const { data: lowStockItems } = useLowStockItems({
    enabled: filters.lowStockOnly,
  });

  const stats = useItemsStats(items ?? []);

  return (
    <div className="flex h-full flex-col gap-6 p-6">
      <ItemsStatsCards stats={stats} isLoading={isPending} />

      <ItemsListView
        items={filters.lowStockOnly ? (lowStockItems ?? []) : (items ?? [])}
        isLoading={isPending}
        filters={filters}
        updateFilter={updateFilter}
        resetFilters={resetFilters}
      />
    </div>
  );
}
