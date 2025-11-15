import type { Route } from "./+types/invoices";
import InvoicesDataTable from "./components/invoices-list";
import useInvoicesContainer from "./container/invoices/container.hooks";
import InvoicesViewLayout from "./layouts/invoices-view.layout";

export const action = async ({ request, params }: Route.ActionArgs) => {
  return {};
};

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  return {};
};

export default function Component({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { invoices, meta, isPending, filters, updateFilter, resetFilters } =
    useInvoicesContainer();

  return (
    <InvoicesViewLayout
      filters={filters}
      onFilterChange={updateFilter}
      onResetFilters={resetFilters}
      totalInvoices={meta?.totalItems || 0}
      totalPages={meta?.totalPages}
      currentPage={meta?.page}
    >
      <InvoicesDataTable
        invoices={invoices}
        isLoading={isPending}
        pageCount={meta?.totalPages}
        currentPage={meta?.page}
        onPageChange={(page) => updateFilter("Page", page)}
      />
    </InvoicesViewLayout>
  );
}
