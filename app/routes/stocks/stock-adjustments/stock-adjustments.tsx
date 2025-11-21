import StockAdjustmentsListView from "./components/stock-adjustments-list-view";
import useStockAdjustmentFilters from "./container/filter.hooks";
import { useStockAdjustmentList } from "./container/query.hooks";
import StockAdjustmentsLayout from "./layouts/stock-adjustments.layout";

export default function StockAdjustmentsRoute() {
  // Filter state
  const { filters, updateFilter, resetFilters } = useStockAdjustmentFilters();

  // Query with filters
  const { data: adjustments, isPending } = useStockAdjustmentList({
    includeApplied: filters.includeApplied,
  });

  return (
    <StockAdjustmentsLayout
      filters={filters}
      updateFilter={updateFilter}
      resetFilters={resetFilters}
      totalItems={adjustments?.length ?? 0}
    >
      <StockAdjustmentsListView
        adjustments={adjustments || []}
        isLoading={isPending}
      />
    </StockAdjustmentsLayout>
  );
}
