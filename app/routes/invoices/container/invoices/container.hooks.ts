import { useInvoices } from "./query.hooks";
import useInvoiceFilters from "./filter.hooks";

function useInvoicesContainer() {
  const { filters, updateFilter, resetFilters } = useInvoiceFilters();

  const { data: response, isPending, refetch } = useInvoices(filters);

  const invoices = response?.data || [];
  const meta = response?.meta || {
    page: 1,
    pageSize: 10,
    total: invoices.length,
    hasNext: false,
  };

  return {
    invoices: invoices,
    meta: {
      page: meta.page,
      pageSize: meta.pageSize,
      totalItems: meta.total,
      totalPages: Math.ceil(meta.total / meta.pageSize),
      hasNext: meta.hasNext,
    },
    isPending,
    filters,
    updateFilter,
    resetFilters,
    refetch,
  };
}

export default useInvoicesContainer;
