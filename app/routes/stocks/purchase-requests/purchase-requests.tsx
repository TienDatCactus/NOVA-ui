import PurchaseRequestsListView from "./components/purchase-requests-list-view";
import usePurchaseRequestFilters from "./container/filter.hooks";
import { usePurchaseRequestList } from "./container/query.hooks";
import PurchaseRequestsLayout from "./layouts/purchase-requests.layout";

export default function PurchaseRequestsRoute() {
  const { filters, updateFilter, resetFilters } = usePurchaseRequestFilters();

  const { data: purchaseRequests, isPending } = usePurchaseRequestList({
    status: filters.status,
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
