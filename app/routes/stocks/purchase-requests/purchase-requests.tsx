import PurchaseRequestsListView from "./components/purchase-requests-list-view";
import usePurchaseRequestFilters from "./container/filter.hooks";
import { usePurchaseRequestList } from "./container/query.hooks";
import PurchaseRequestsLayout from "./layouts/purchase-requests.layout";
import { AuthLoader, RouteModule, Permission } from "~/lib/auth/auth.loader";
import type { Route } from "./+types/purchase-requests";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Yêu Cầu Mua Hàng - NOVA Hotel Management" },
    { name: "description", content: "Quản lý yêu cầu mua hàng và nhập kho" },
  ];
}

export const clientLoader = () =>
  AuthLoader.guard(RouteModule.Stock, Permission.Read);

export default function PurchaseRequestsRoute() {
  const { filters, updateFilter, resetFilters } = usePurchaseRequestFilters();

  const { data: purchaseRequests, isPending } = usePurchaseRequestList({
    status: filters.status || undefined,
  });

  return (
    <PurchaseRequestsLayout
      filters={filters}
      updateFilter={updateFilter}
      resetFilters={resetFilters}
      totalItems={purchaseRequests?.length ?? 0}
    >
      <PurchaseRequestsListView
        purchaseRequests={purchaseRequests || []}
        isLoading={isPending}
      />
    </PurchaseRequestsLayout>
  );
}
