import type { Route } from "./+types/pos-orders";
import POSOrderList from "./components/pos-order-list";
import { usePOSOrdersByInvoice } from "./container/pos-orders-query.hooks";
import POSOrderViewLayout from "./layouts/pos-order-view.layout";
import { useState } from "react";

export default function Component({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  // TODO: Get invoiceId from route params or state
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>("");

  const { data, isPending, refetch } = usePOSOrdersByInvoice(selectedInvoiceId);

  return (
    <POSOrderViewLayout
      selectedInvoiceId={selectedInvoiceId}
      onInvoiceSelect={setSelectedInvoiceId}
    >
      <POSOrderList
        orders={data || []}
        isLoading={isPending}
        refetch={refetch}
      />
    </POSOrderViewLayout>
  );
}
