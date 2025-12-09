import StockAdjustmentsListView from "./components/stock-adjustments-list-view";
import useStockAdjustmentFilters from "./container/filter.hooks";
import { useStockAdjustmentList } from "./container/query.hooks";
import StockAdjustmentsLayout from "./layouts/stock-adjustments.layout";
import { AuthLoader, RouteModule, Permission } from "~/lib/auth/auth.loader";
import type { Route } from "./+types/stock-adjustments";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Điều Chỉnh Tồn Kho - NOVA Hotel Management" },
    { name: "description", content: "Quản lý điều chỉnh tồn kho và kiểm kê" },
  ];
}

export const clientLoader = () =>
  AuthLoader.guard(RouteModule.Stock, Permission.Read);

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
